'use client';

/**
 * Hook for fetching token change history with pagination.
 */
import { useInfiniteQuery } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { tokenHistoryQueryOptions } from '../query-options';
import type { TokenChangeHistoryEntry } from '../schemas';
import type { TokenHistoryFilters } from '../types';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useTokenChangeHistory hook.
 */
export type UseTokenChangeHistoryReturn = {
  /** Flattened array of all loaded history entries */
  entries: TokenChangeHistoryEntry[] | undefined;
  /** Whether the initial query is loading */
  isLoading: boolean;
  /** Whether any page is currently loading */
  isFetching: boolean;
  /** Whether loading more pages */
  isLoadingMore: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Whether there are more pages to load */
  hasMore: boolean;
  /** Total count of entries (from X-Total-Count header, may be null) */
  totalCount: number | null;
  /** Load the next page of results */
  loadMore: () => void;
  /** Refetch all pages */
  refetch: () => void;
};

/**
 * Fetch token change history with infinite scrolling/pagination.
 *
 * Uses cursor-based pagination from the Link header. Results are automatically
 * flattened into a single entries array.
 *
 * @endpoint GET /auth/api/v1/users/{username}/token-change-history
 *
 * @param username - Username to fetch history for. Query is disabled if undefined.
 * @param options - Filter options (tokenType, token, since, until, etc.)
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function TokenHistory() {
 *   const { userInfo } = useUserInfo();
 *   const {
 *     entries,
 *     isLoading,
 *     hasMore,
 *     loadMore,
 *     isLoadingMore,
 *     totalCount
 *   } = useTokenChangeHistory(userInfo?.username, { limit: 20 });
 *
 *   if (isLoading) return <div>Loading history...</div>;
 *
 *   return (
 *     <div>
 *       <p>Total: {totalCount ?? 'unknown'}</p>
 *       <ul>
 *         {entries?.map((entry, idx) => (
 *           <li key={`${entry.token}-${idx}`}>
 *             {entry.action} - {entry.token_name ?? entry.token}
 *           </li>
 *         ))}
 *       </ul>
 *       {hasMore && (
 *         <button onClick={loadMore} disabled={isLoadingMore}>
 *           {isLoadingMore ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With filters
 * function FilteredHistory() {
 *   const { entries } = useTokenChangeHistory(username, {
 *     tokenType: 'user',
 *     since: new Date('2024-01-01'),
 *     limit: 50,
 *   });
 *   // ...
 * }
 * ```
 */
export function useTokenChangeHistory(
  username: string | undefined,
  options: Omit<TokenHistoryFilters, 'cursor'> = {},
  repertoireUrl?: string
): UseTokenChangeHistoryReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;

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
    tokenHistoryQueryOptions(username ?? '', options, effectiveUrl)
  );

  // Flatten all pages into a single entries array
  const entries = data?.pages.flatMap((page) => page.entries);

  // Get total count from first page (all pages should have same total)
  const totalCount = data?.pages[0]?.totalCount ?? null;

  // Load more function
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    entries,
    isLoading: isLoading && !!username,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    error: error ?? null,
    hasMore: hasNextPage ?? false,
    totalCount,
    loadMore,
    refetch,
  };
}
