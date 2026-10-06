/**
 * Server-side prefetch of the signed-in user's Gafaelfawr scopes for the root
 * layout.
 */

import { userScopesQueryOptions } from '@lsst-sqre/gafaelfawr-client';
import type { QueryClient } from '@tanstack/react-query';

import { serverAuthQuery } from './serverAuthQuery';

/**
 * Prefetch the signed-in user's Gafaelfawr scopes into the root layout's query
 * client, so they are dehydrated alongside service discovery.
 *
 * The header nav, homepage hero, and Apps menu gate services on the scopes in
 * `useUserScopes()`. Without this prefetch those scopes are unknown on the
 * first client render, so for a signed-in user a gated Portal or Notebooks
 * entry appears and then vanishes, and the Apps menu's scope-gated items pop
 * in, once the browser's own login request resolves. An anonymous visitor
 * hydrates as `null` scopes, exactly what the browser would have derived.
 *
 * Where the scopes come from depends on how the request reached the pod (see
 * `serverAuthQuery`):
 * - on a plain-ingress route, from login info with the forwarded session
 *   cookie, sharing the one `GET /auth/api/v1/login` that `prefetchLoginInfo`
 *   makes into the same query client;
 * - on a GafaelfawrIngress route, from `GET /auth/api/v1/token-info` for the
 *   delegated token the ingress sends in `X-Auth-Request-Token`, presented as
 *   a bearer token. The internal token's scopes are the user's own, restricted
 *   to the list the ingress requests (`config.delegate.internal.scopes`), so
 *   the ingress must request every scope the UI gates on. Gafaelfawr could
 *   instead forward the user's scopes in a request header, which would remove
 *   this round trip and the per-environment scope list; that has not been
 *   requested yet.
 *
 * When the request cannot be made, nothing is prefetched and the client
 * derives the scopes from login info itself.
 *
 * `queryClient` must be the per-request client the layout creates, so one
 * user's scopes are never dehydrated into another user's page.
 *
 * @param queryClient - The root layout's per-request query client
 * @param repertoireUrl - The configured Repertoire discovery URL, if any
 */
export async function prefetchUserScopes(
  queryClient: QueryClient,
  repertoireUrl: string | undefined
): Promise<void> {
  const request = await serverAuthQuery(
    queryClient,
    repertoireUrl,
    'user-scopes'
  );
  if (!request) {
    return;
  }
  await queryClient.prefetchQuery(
    userScopesQueryOptions(request.gafaelfawrUrl, {
      ...request.config,
      source: request.mode === 'delegated' ? 'token-info' : 'login-info',
    })
  );
}
