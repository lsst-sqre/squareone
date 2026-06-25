'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationsReadMutationOptions } from '../mutation-options';

/**
 * Mark user notifications read via a TanStack Query mutation.
 *
 * Wraps {@link markNotificationsReadMutationOptions}, wiring in the
 * `QueryClient` so a successful mark-read invalidates the user-notifications
 * list(s), the unread count, and each affected detail query. The returned
 * mutation's `mutate`/`mutateAsync` take `{ ids, csrfToken }`; the caller
 * sources the CSRF token from Gafaelfawr login info.
 *
 * @endpoint POST /v1/notifications/read
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 */
export function useMarkNotificationsRead(semaphoreUrl: string) {
  const queryClient = useQueryClient();
  return useMutation(
    markNotificationsReadMutationOptions(semaphoreUrl, queryClient)
  );
}
