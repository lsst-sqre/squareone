/**
 * Server-side prefetch of the signed-in user's Gafaelfawr user info for the
 * root layout.
 */

import { userInfoQueryOptions } from '@lsst-sqre/gafaelfawr-client';
import type { QueryClient } from '@tanstack/react-query';

import { serverAuthQuery } from './serverAuthQuery';

/**
 * Prefetch Gafaelfawr user info (the username) into the root layout's query
 * client, so it is dehydrated alongside service discovery.
 *
 * The header's log-in control and user menu read `useUserInfo()`. Without
 * this prefetch the user is unknown on the server render and the first client
 * render, so a signed-in user sees "Log in" until `GET /auth/api/v1/user-info`
 * resolves in the browser. With it, both renders show the user's menu. An
 * anonymous request gets a 401, which `userInfoQueryOptions` degrades to empty
 * user info: that hydrates as "not logged in", so both renders show "Log in".
 *
 * The request is made on the visitor's behalf as `serverAuthQuery` describes
 * (forwarded session cookie, uncached, Gafaelfawr URL from the discovery
 * already in `queryClient`); when it cannot be, nothing is prefetched and the
 * client fetches user info itself, as before.
 *
 * `queryClient` must be the per-request client the layout creates, so one
 * user's info is never dehydrated into another user's page.
 *
 * @param queryClient - The root layout's per-request query client
 * @param repertoireUrl - The configured Repertoire discovery URL, if any
 */
export async function prefetchUserInfo(
  queryClient: QueryClient,
  repertoireUrl: string | undefined
): Promise<void> {
  const request = await serverAuthQuery(
    queryClient,
    repertoireUrl,
    'user-info'
  );
  if (!request) {
    return;
  }
  await queryClient.prefetchQuery(
    userInfoQueryOptions(request.gafaelfawrUrl, request.config)
  );
}
