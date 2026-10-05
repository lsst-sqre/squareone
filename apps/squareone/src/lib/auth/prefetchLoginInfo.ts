/**
 * Server-side prefetch of the signed-in user's Gafaelfawr login info for the
 * root layout.
 */

import { loginInfoQueryOptions } from '@lsst-sqre/gafaelfawr-client';
import type { QueryClient } from '@tanstack/react-query';

import logger from '../logger';
import { serverAuthQuery } from './serverAuthQuery';

/**
 * Prefetch Gafaelfawr login info (the CSRF token, the user's scopes, and the
 * known scopes) into the root layout's query client, so it is dehydrated
 * alongside service discovery.
 *
 * Pages that mutate through Gafaelfawr or Semaphore read `useLoginInfo()` for
 * the CSRF token, and the token forms for the known-scope list. Hydrating it
 * spares the browser its own `GET /auth/api/v1/login` while the entry is
 * fresh. An anonymous request gets a 401, which `loginInfoQueryOptions`
 * degrades to `null`: that hydrates as "no login info", exactly what the
 * browser would have fetched. (The user's scopes, which gate the header, are
 * hydrated separately by `prefetchUserScopes`, which shares this request.)
 *
 * The request is made on the visitor's behalf as `serverAuthQuery` describes
 * (forwarded session cookie, uncached, Gafaelfawr URL from the discovery
 * already in `queryClient`); when it cannot be, nothing is prefetched and the
 * client fetches login info itself, as before.
 *
 * Login info is cookie-only: on a GafaelfawrIngress route (`mode:
 * 'delegated'`) the session cookie never reaches the pod and a request with
 * the delegated token would get a 401, hydrating a signed-in user as
 * anonymous. Nothing is prefetched there either, so the browser, which still
 * holds the cookie, fetches it.
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
  const request = await serverAuthQuery(
    queryClient,
    repertoireUrl,
    'login-info'
  );
  if (!request) {
    return;
  }
  if (request.mode === 'delegated') {
    logger.debug(
      'Login info is cookie-only; not prefetched on a GafaelfawrIngress route'
    );
    return;
  }
  await queryClient.prefetchQuery(
    loginInfoQueryOptions(request.gafaelfawrUrl, request.config)
  );
}
