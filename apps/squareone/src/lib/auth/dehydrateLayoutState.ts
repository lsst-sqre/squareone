/**
 * Dehydration of the root layout's per-request query client.
 */

import { gafaelfawrKeys } from '@lsst-sqre/gafaelfawr-client';
import {
  type DehydratedState,
  defaultShouldDehydrateQuery,
  dehydrate,
  matchQuery,
  type QueryClient,
} from '@tanstack/react-query';

/**
 * Dehydrate the root layout's per-request query client for the
 * `HydrationBoundary`, leaving out Gafaelfawr login info.
 *
 * Login info carries the CSRF token that every Gafaelfawr and Semaphore
 * mutation sends, and that token is cookie-bound: Gafaelfawr mints it lazily
 * on the first `GET /auth/api/v1/login` of a session and persists it only
 * through a `Set-Cookie` on that response. A server-side request discards the
 * `Set-Cookie`, so a token fetched by the server never reaches the browser's
 * cookie, and hydrating it would make every mutation fail with "Invalid CSRF
 * token" for a freshly signed-in user. Login info must therefore never be
 * dehydrated: the browser fetches it itself, so the cookie and the cached
 * token are minted together.
 *
 * Excluding the entry here, rather than only not prefetching it, is the guard:
 * on a plain-ingress route the server-side scopes prefetch reads the scopes
 * through `client.fetchQuery(loginInfoQueryOptions(...))`, which caches login
 * info in the layout's client. The scopes and user info the header gates on
 * are still dehydrated, as is everything else the default filter (successful
 * queries) keeps.
 *
 * @param queryClient - The root layout's per-request query client
 * @returns The dehydrated state, without any login-info entry
 */
export function dehydrateLayoutState(
  queryClient: QueryClient
): DehydratedState {
  const shouldDehydrate =
    queryClient.getDefaultOptions().dehydrate?.shouldDehydrateQuery ??
    defaultShouldDehydrateQuery;
  return dehydrate(queryClient, {
    shouldDehydrateQuery: (query) =>
      shouldDehydrate(query) &&
      !matchQuery({ queryKey: gafaelfawrKeys.loginInfo() }, query),
  });
}
