'use client';

import { useQuery } from '@tanstack/react-query';
import { unreadNotificationCountQueryOptions } from '../query-options';

/**
 * Options for the {@link useUnreadNotificationCount} hook.
 */
export type UseUnreadNotificationCountOptions = {
  /**
   * Background poll cadence in **seconds**. Converted to milliseconds for
   * TanStack Query's `refetchInterval`. Omit to disable interval polling
   * (the count still refetches on navigation and after mark-read mutations).
   */
  pollIntervalSeconds?: number;
};

/**
 * Return type for the {@link useUnreadNotificationCount} hook.
 */
export type UseUnreadNotificationCountReturn = {
  /** The unread count, or undefined while loading or on error */
  count: number | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query errored */
  isError: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the unread count */
  refetch: () => void;
};

/**
 * Fetch the authenticated user's unread-notification count.
 *
 * Backs the header user-menu badge. Reads the count from the `X-Total-Count`
 * header of an `?unread=true&limit=1` request (see
 * {@link unreadNotificationCountQueryOptions}) and, when `pollIntervalSeconds`
 * is provided, polls in the background on that cadence.
 *
 * @endpoint GET /v1/notifications?unread=true&limit=1
 *
 * @param semaphoreUrl - Base URL of the Semaphore service. The query is
 *   disabled when empty.
 * @param options - Optional background poll cadence
 */
export function useUnreadNotificationCount(
  semaphoreUrl: string,
  options: UseUnreadNotificationCountOptions = {}
): UseUnreadNotificationCountReturn {
  const { pollIntervalSeconds } = options;
  const { data, isPending, isError, error, refetch } = useQuery(
    unreadNotificationCountQueryOptions(semaphoreUrl, {
      refetchInterval:
        pollIntervalSeconds !== undefined
          ? pollIntervalSeconds * 1000
          : undefined,
    })
  );

  return {
    count: data,
    // Guard against the disabled state (empty url): a disabled query stays
    // `pending` indefinitely, so report `false` rather than a perpetual
    // loading state (mirrors `useUserNotification`).
    isLoading: isPending && !!semaphoreUrl,
    isError,
    error: error ?? null,
    refetch,
  };
}
