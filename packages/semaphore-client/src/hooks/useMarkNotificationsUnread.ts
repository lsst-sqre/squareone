'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationsUnreadMutationOptions } from '../mutation-options';

/**
 * Mark user notifications unread via a TanStack Query mutation.
 *
 * The mirror of {@link useMarkNotificationsRead}. Wraps
 * {@link markNotificationsUnreadMutationOptions}, wiring in the `QueryClient`
 * so a successful mark-unread invalidates the user-notifications list(s), the
 * unread count, and each affected detail query. The returned mutation's
 * `mutate`/`mutateAsync` take `{ ids, csrfToken }`; the caller sources the CSRF
 * token from Gafaelfawr login info.
 *
 * @endpoint POST /v1/notifications/unread
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 */
export function useMarkNotificationsUnread(semaphoreUrl: string) {
  const queryClient = useQueryClient();
  return useMutation(
    markNotificationsUnreadMutationOptions(semaphoreUrl, queryClient)
  );
}
