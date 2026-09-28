/**
 * Server-side prefetch of the signed-in user's Gafaelfawr login info for the
 * root layout.
 */

import { loginInfoQueryOptions } from '@lsst-sqre/gafaelfawr-client';
import type { QueryClient } from '@tanstack/react-query';

import { serverAuthQuery } from './serverAuthQuery';

/**
 * Prefetch Gafaelfawr login info (the user's scopes) into the root layout's
 * query client, so it is dehydrated alongside service discovery.
 *
 * The header nav, homepage hero, and Apps menu gate services on the scopes in
 * `useLoginInfo()`. Without this prefetch those scopes are unknown on the first
 * client render, so for a signed-in user a gated Portal or Notebooks entry
 * appears and then vanishes, and the Apps menu's scope-gated items pop in, once
 * `GET /auth/api/v1/login` resolves in the browser. An anonymous request gets a
 * 401, which `loginInfoQueryOptions` degrades to `null`: that hydrates as "no
 * login info", exactly what the browser would have fetched, and spares the
 * client its own 401 while the entry is fresh.
 *
 * The request is made on the visitor's behalf as `serverAuthQuery` describes
 * (forwarded session cookie, uncached, Gafaelfawr URL from the discovery
 * already in `queryClient`); when it cannot be, nothing is prefetched and the
 * client fetches login info itself, as before.
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
  await queryClient.prefetchQuery(
    loginInfoQueryOptions(request.gafaelfawrUrl, request.config)
  );
}
