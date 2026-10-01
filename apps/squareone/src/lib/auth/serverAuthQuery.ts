/**
 * Shared set-up for the root layout's server-side Gafaelfawr prefetches
 * (`prefetchLoginInfo`, `prefetchUserInfo`).
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
export type ServerAuthSite = 'login-info' | 'user-info';

/** Where a server-side auth prefetch fetches from, and its query options. */
export type ServerAuthQuery = {
  /** Gafaelfawr's API base URL, from service discovery. */
  gafaelfawrUrl: string;
  /** Options for `loginInfoQueryOptions` / `userInfoQueryOptions`. */
  config: AuthQueryConfig;
};

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
 * Gafaelfawr authenticates these endpoints by session cookie only, and a
 * server-side `fetch` has no cookie jar, so the incoming request's `cookie`
 * header is forwarded; with `isServer`, the fetch is uncached. An anonymous
 * request gets a 401, which the query options degrade to their anonymous
 * fallback (logged at debug, not reported), exactly what the browser would
 * have fetched. Other report-worthy failures are logged and reported to Sentry
 * with the `site` tag.
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

  const cookie = (await headers()).get('cookie');
  return {
    gafaelfawrUrl,
    config: {
      headers: cookie ? { cookie } : undefined,
      isServer: true,
      logger: anonymousAwareLogger(site),
      reportError: makeReportError({ isServer: true }),
      context: { site, package: 'gafaelfawr-client' },
    },
  };
}
