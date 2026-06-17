'use client';

import { useQuery } from '@tanstack/react-query';
import { adminNotificationQueryOptions } from '../query-options';
import type { UserNotification } from '../schemas';

/**
 * Return type for the {@link useAdminNotification} hook.
 */
export type UseAdminNotificationReturn = {
  /** The notification, or undefined while loading or on error */
  notification: UserNotification | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query errored (e.g. unknown id) */
  isError: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the notification */
  refetch: () => void;
};

/**
 * Fetch a single admin notification by id.
 *
 * Unlike the list hook, errors are surfaced (not swallowed) so the detail
 * page can render a graceful not-found state.
 *
 * @endpoint GET /v1/admin/notifications/{id}
 *
 * @param semaphoreUrl - Base URL of the Semaphore service. The query is
 *   disabled when empty.
 * @param id - Opaque notification id. The query is disabled when empty.
 */
export function useAdminNotification(
  semaphoreUrl: string,
  id: string
): UseAdminNotificationReturn {
  const { data, isPending, isError, error, refetch } = useQuery(
    adminNotificationQueryOptions(semaphoreUrl, id)
  );

  return {
    notification: data,
    isLoading: isPending,
    isError,
    error: error ?? null,
    refetch,
  };
}
