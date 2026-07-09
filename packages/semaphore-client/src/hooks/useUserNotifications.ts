'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { userNotificationsInfiniteQueryOptions } from '../query-options';
import type { UserNotificationSummary } from '../schemas';
import type { UserNotificationFilters } from '../types';

/**
 * Return type for the {@link useUserNotifications} hook.
 *
 * Mirrors `useAdminNotifications`'s `{ entries, hasMore, loadMore, ... }` shape,
 * with user-facing {@link UserNotificationSummary} entries.
 */
export type UseUserNotificationsReturn = {
  /** Flattened array of all loaded notifications across pages */
  entries: UserNotificationSummary[] | undefined;
  /** Whether the initial page is loading */
  isLoading: boolean;
  /** Whether any page is currently fetching */
  isFetching: boolean;
  /** Whether the next page is currently loading */
  isLoadingMore: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Whether there are more pages to load */
  hasMore: boolean;
  /** Total count of notifications (from X-Total-Count header, may be null) */
  totalCount: number | null;
  /** Load the next page of older notifications */
  loadMore: () => void;
  /** Refetch all loaded pages */
  refetch: () => void;
};

/**
 * Fetch the authenticated user's notifications with cursor-based "Load more"
 * pagination.
 *
 * Pages are flattened into a single `entries` array, most-recent first (server
 * order); see {@link userNotificationsInfiniteQueryOptions}.
 *
 * @endpoint GET /v1/notifications/messages
 *
 * @param semaphoreUrl - Base URL of the Semaphore service. The query is
 *   disabled when empty.
 * @param filters - `unread` / `limit` filters
 */
export function useUserNotifications(
  semaphoreUrl: string,
  filters: UserNotificationFilters = {}
): UseUserNotificationsReturn {
  const {
    data,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    userNotificationsInfiniteQueryOptions(semaphoreUrl, filters)
  );

  // Flatten all pages into a single entries array.
  const entries = data?.pages.flatMap((page) => page.entries);

  // All pages report the same total; read it from the first page.
  const totalCount = data?.pages[0]?.totalCount ?? null;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    entries,
    // `isLoading` (isPending && isFetching) is already false when the query is
    // disabled (empty url), since a disabled query never enters the fetching
    // state — no extra guard needed here (mirrors `useAdminNotifications`).
    isLoading,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    error: error ?? null,
    hasMore: hasNextPage ?? false,
    totalCount,
    loadMore,
    refetch,
  };
}
