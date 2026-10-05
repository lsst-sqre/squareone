/**
 * Shared set-up for the root layout's server-side Gafaelfawr prefetches
 * (`prefetchLoginInfo`, `prefetchUserInfo`, `prefetchUserScopes`).
 */

import {
  type AuthQueryConfig,
  GafaelfawrError,
  type Logger,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  discoveryQueryOptions,
} from '@lsst-sqre/repertoire-client';
import type { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';

import logger from '../logger';
import { makeReportError } from '../sentry/reportError';

/** The ambient auth queries the layout prefetches, as their Sentry `site`. */
export type ServerAuthSite = 'login-info' | 'user-info' | 'user-scopes';

/**
 * How a server-side auth prefetch authenticates to Gafaelfawr.
 *
 * - `cookie`: the incoming request's `cookie` header is forwarded. This is a
 *   route on the plain nginx ingress, where the browser's Gafaelfawr session
 *   cookie reaches the pod.
 * - `delegated`: the request crossed a GafaelfawrIngress, which strips
 *   Gafaelfawr's own cookie from the `Cookie` header before it reaches the pod
 *   and, when configured to, delegates an internal token in
 *   `X-Auth-Request-Token`. That token is presented as a bearer token instead.
 */
export type ServerAuthMode = 'cookie' | 'delegated';

/** Where a server-side auth prefetch fetches from, and its query options. */
export type ServerAuthQuery = {
  /** Gafaelfawr's API base URL, from service discovery. */
  gafaelfawrUrl: string;
  /** Options for `loginInfoQueryOptions` / `userInfoQueryOptions`. */
  config: AuthQueryConfig;
  /** How the prefetch authenticates; see {@link ServerAuthMode}. */
  mode: ServerAuthMode;
};

/** Gafaelfawr's headers on a request that crossed a GafaelfawrIngress. */
const AUTH_REQUEST_USER_HEADER = 'x-auth-request-user';
const AUTH_REQUEST_TOKEN_HEADER = 'x-auth-request-token';

/**
 * Whether the process has already warned about a GafaelfawrIngress route that
 * delegates no token. The ingress configuration stays wrong for the life of
 * the deployment, so one warning per process is signal enough.
 */
let warnedMissingDelegation = false;

/**
 * The credential for a prefetch on the visitor's behalf, from the incoming
 * request's headers: the delegated token as a bearer token when the request
 * crossed a GafaelfawrIngress, otherwise the forwarded session cookie. The two
 * are never combined. The token is per-request and never leaves this module
 * other than in the `authorization` header of the Gafaelfawr request.
 */
function requestCredential(
  requestHeaders: Awaited<ReturnType<typeof headers>>
): { mode: ServerAuthMode; headers: Record<string, string> | undefined } {
  const token = requestHeaders.get(AUTH_REQUEST_TOKEN_HEADER);
  if (token) {
    return { mode: 'delegated', headers: { authorization: `Bearer ${token}` } };
  }

  const ingressUser = requestHeaders.get(AUTH_REQUEST_USER_HEADER);
  if (ingressUser && !warnedMissingDelegation) {
    warnedMissingDelegation = true;
    logger.warn(
      'Request crossed a GafaelfawrIngress that delegates no token: the ' +
        'ingress strips the session cookie, so server-side auth prefetches ' +
        'will hydrate the signed-in user as anonymous. Add ' +
        '`config.delegate.internal` to the ingress.'
    );
  }

  const cookie = requestHeaders.get('cookie');
  return { mode: 'cookie', headers: cookie ? { cookie } : undefined };
}

/**
 * The app logger, except that the 401 an anonymous visitor's request gets is
 * logged at debug level: `reportingQueryFn` logs every failure as an error,
 * and every anonymous page view makes these requests, so error records would
 * flood the server logs and Sentry Logs (which ship `warn` and above). Every
 * other failure is still logged as an error.
 */
function anonymousAwareLogger(site: ServerAuthSite): Logger {
  return {
    debug: (obj, msg) => logger.debug(obj, msg),
    warn: (obj, msg) => logger.warn(obj, msg),
    error: (obj, msg) => {
      if (obj.err instanceof GafaelfawrError && obj.err.statusCode === 401) {
        logger.debug(obj, `Not signed in; prefetched ${site} is anonymous`);
      } else {
        logger.error(obj, msg);
      }
    },
  };
}

/**
 * Resolve how to prefetch one of Gafaelfawr's ambient auth queries on the
 * visitor's behalf, or `null` when it cannot be prefetched.
 *
 * A server-side `fetch` has no cookie jar, so on a plain-ingress route the
 * incoming request's `cookie` header is forwarded (`mode: 'cookie'`). On a
 * GafaelfawrIngress route the ingress has stripped Gafaelfawr's session cookie
 * and delegated an internal token instead, which is presented as a bearer
 * token (`mode: 'delegated'`; see {@link ServerAuthMode}). Callers prefetching
 * a cookie-only endpoint (login info) must skip delegated mode. With
 * `isServer`, the fetch is uncached. An anonymous request gets a 401, which
 * the query options degrade to their anonymous fallback (logged at debug, not
 * reported), exactly what the browser would have fetched. Other report-worthy
 * failures are logged and reported to Sentry with the `site` tag.
 *
 * The Gafaelfawr URL comes from the discovery document the layout already
 * prefetched into `queryClient` (the package default, `/auth/api/v1`, is
 * relative and unusable on the server), so call this after that prefetch. When
 * `repertoireUrl` is unset, or discovery has no Gafaelfawr URL, the result is
 * `null` and the client fetches the query itself.
 *
 * @param queryClient - The root layout's per-request query client
 * @param repertoireUrl - The configured Repertoire discovery URL, if any
 * @param site - The query being prefetched, for logs and Sentry tags
 */
export async function serverAuthQuery(
  queryClient: QueryClient,
  repertoireUrl: string | undefined,
  site: ServerAuthSite
): Promise<ServerAuthQuery | null> {
  if (!repertoireUrl) {
    return null;
  }

  const discovery = queryClient.getQueryData(
    discoveryQueryOptions(repertoireUrl).queryKey
  );
  const gafaelfawrUrl = discovery
    ? createDiscoveryQuery(discovery).getGafaelfawrUrl()
    : undefined;
  if (!gafaelfawrUrl) {
    logger.debug(`No Gafaelfawr URL in discovery, skipping ${site}`);
    return null;
  }

  const credential = requestCredential(await headers());
  logger.debug({ site, mode: credential.mode }, 'Server-side auth prefetch');
  return {
    gafaelfawrUrl,
    mode: credential.mode,
    config: {
      headers: credential.headers,
      isServer: true,
      logger: anonymousAwareLogger(site),
      reportError: makeReportError({ isServer: true }),
      context: { site, package: 'gafaelfawr-client' },
    },
  };
}
