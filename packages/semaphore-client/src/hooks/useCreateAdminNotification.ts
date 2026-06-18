'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminNotificationMutationOptions } from '../mutation-options';

/**
 * Create an admin notification via a TanStack Query mutation.
 *
 * Wraps {@link createAdminNotificationMutationOptions}, wiring in the
 * `QueryClient` so a successful create invalidates the admin-notifications
 * list query. The returned mutation's `mutate`/`mutateAsync` take
 * `{ notification, csrfToken }`; the caller sources the CSRF token from
 * Gafaelfawr login info.
 *
 * @endpoint POST /v1/admin/notifications
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 */
export function useCreateAdminNotification(semaphoreUrl: string) {
  const queryClient = useQueryClient();
  return useMutation(
    createAdminNotificationMutationOptions(semaphoreUrl, queryClient)
  );
}
