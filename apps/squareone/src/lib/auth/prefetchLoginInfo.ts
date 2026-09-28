/**
 * Server-side prefetch of the signed-in user's Gafaelfawr login info for the
 * root layout.
 */

import {
  GafaelfawrError,
  type Logger,
  loginInfoQueryOptions,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  discoveryQueryOptions,
} from '@lsst-sqre/repertoire-client';
import type { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';

import logger from '../logger';
import { makeReportError } from '../sentry/reportError';

/**
 * The app logger, except that the 401 an anonymous visitor's login request
 * gets is logged at debug level: `reportingQueryFn` logs every failure as an
 * error, and every anonymous page view makes this request, so error records
 * would flood the server logs and Sentry Logs (which ship `warn` and above).
 * Every other failure is still logged as an error.
 */
const loginInfoLogger: Logger = {
  debug: (obj, msg) => logger.debug(obj, msg),
  warn: (obj, msg) => logger.warn(obj, msg),
  error: (obj, msg) => {
    if (obj.err instanceof GafaelfawrError && obj.err.statusCode === 401) {
      logger.debug(obj, 'Not signed in; prefetched login info is null');
    } else {
      logger.error(obj, msg);
    }
  },
};

/**
 * Prefetch Gafaelfawr login info (the user's scopes) into the root layout's
 * query client, so it is dehydrated alongside service discovery.
 *
 * The header nav, homepage hero, and Apps menu gate services on the scopes in
 * `useLoginInfo()`. Without this prefetch those scopes are unknown on the first
 * client render, so for a signed-in user a gated Portal or Notebooks entry
 * appears and then vanishes, and the Apps menu's scope-gated items pop in, once
 * `GET /auth/api/v1/login` resolves in the browser.
 *
 * Gafaelfawr's login endpoint authenticates by session cookie only, and a
 * server-side `fetch` has no cookie jar, so the incoming request's `cookie`
 * header is forwarded; the fetch is uncached. An anonymous request gets a 401,
 * which `loginInfoQueryOptions` degrades to `null`: that hydrates as "no login
 * info", exactly what the browser would have fetched, and spares the client its
 * own 401 while the entry is fresh.
 *
 * The Gafaelfawr URL comes from the discovery document the layout already
 * prefetched into `queryClient` (the package default, `/auth/api/v1`, is
 * relative and unusable on the server), so call this after that prefetch. When
 * `repertoireUrl` is unset, or discovery has no Gafaelfawr URL, nothing is
 * prefetched and the client fetches login info itself, as before.
 *
 * `queryClient` must be the per-request client the layout creates, so one
 * user's login info is never dehydrated into another user's page.
 *
 * @param queryClient - The root layout's per-request query client
 * @param repertoireUrl - The configured Repertoire discovery URL, if any
 */
export async function prefetchLoginInfo(
  queryClient: QueryClient,
  repertoireUrl: string | undefined
): Promise<void> {
  if (!repertoireUrl) {
    return;
  }

  const discovery = queryClient.getQueryData(
    discoveryQueryOptions(repertoireUrl).queryKey
  );
  const gafaelfawrUrl = discovery
    ? createDiscoveryQuery(discovery).getGafaelfawrUrl()
    : undefined;
  if (!gafaelfawrUrl) {
    logger.debug('No Gafaelfawr URL in discovery, skipping login info');
    return;
  }

  const cookie = (await headers()).get('cookie');
  await queryClient.prefetchQuery(
    loginInfoQueryOptions(gafaelfawrUrl, {
      headers: cookie ? { cookie } : undefined,
      isServer: true,
      logger: loginInfoLogger,
      reportError: makeReportError({ isServer: true }),
      context: { site: 'login-info', package: 'gafaelfawr-client' },
    })
  );
}
