'use client';

import { useQuery } from '@tanstack/react-query';
import { userNotificationQueryOptions } from '../query-options';
import type { UserNotificationFormatted } from '../schemas';

/**
 * Return type for the {@link useUserNotification} hook.
 */
export type UseUserNotificationReturn = {
  /** The notification, or undefined while loading or on error */
  notification: UserNotificationFormatted | undefined;
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
 * Fetch a single user-facing notification by id.
 *
 * Like `useAdminNotification`, errors are surfaced (not swallowed) so the
 * detail page can render a graceful not-found state. Fetching does not
 * auto-mark the notification read.
 *
 * @endpoint GET /v1/notifications/{id}
 *
 * @param semaphoreUrl - Base URL of the Semaphore service. The query is
 *   disabled when empty.
 * @param id - Opaque notification id. The query is disabled when empty.
 */
export function useUserNotification(
  semaphoreUrl: string,
  id: string
): UseUserNotificationReturn {
  const { data, isPending, isError, error, refetch } = useQuery(
    userNotificationQueryOptions(semaphoreUrl, id)
  );

  return {
    notification: data,
    // Guard against the disabled state: when the query is disabled (empty
    // url or id) it stays `pending` indefinitely, so report `false` rather
    // than a perpetual loading state (mirrors `useAdminNotification`).
    isLoading: isPending && !!semaphoreUrl && !!id,
    isError,
    error: error ?? null,
    refetch,
  };
}
