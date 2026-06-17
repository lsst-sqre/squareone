'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { adminNotificationsInfiniteQueryOptions } from '../query-options';
import type { UserNotificationWithUrl } from '../schemas';
import type { AdminNotificationFilters } from '../types';

/**
 * Return type for the {@link useAdminNotifications} hook.
 *
 * Matches the shape exposed by `useTokenChangeHistory` in
 * `@lsst-sqre/gafaelfawr-client`.
 */
export type UseAdminNotificationsReturn = {
  /** Flattened array of all loaded notifications across pages */
  entries: UserNotificationWithUrl[] | undefined;
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
 * Fetch admin notifications with cursor-based "Load more" pagination.
 *
 * Pages are flattened into a single `entries` array. Results are most-recent
 * first (server order); see {@link adminNotificationsInfiniteQueryOptions}.
 *
 * @endpoint GET /v1/admin/notifications
 *
 * @param semaphoreUrl - Base URL of the Semaphore service. The query is
 *   disabled when empty.
 * @param filters - Recipient/sender/date-range/limit filters
 */
export function useAdminNotifications(
  semaphoreUrl: string,
  filters: AdminNotificationFilters = {}
): UseAdminNotificationsReturn {
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
    adminNotificationsInfiniteQueryOptions(semaphoreUrl, filters)
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
    isLoading: isLoading && !!semaphoreUrl,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    error: error ?? null,
    hasMore: hasNextPage ?? false,
    totalCount,
    loadMore,
    refetch,
  };
}
