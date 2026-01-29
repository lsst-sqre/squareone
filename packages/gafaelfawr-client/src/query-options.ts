/**
 * TanStack Query options factories for Gafaelfawr queries.
 *
 * These factory functions return queryOptions objects that can be used
 * with useQuery or prefetched in server components.
 */
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

/**
 * Minimal logger interface compatible with pino's calling convention.
 */
export type Logger = {
  debug: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
};

const defaultLogger: Logger = {
  debug: (obj, msg) => console.log(msg, obj),
  warn: (obj, msg) => console.warn(msg, obj),
  error: (obj, msg) => console.error(msg, obj),
};

import {
  DEFAULT_GAFAELFAWR_URL,
  fetchLoginInfo,
  fetchTokenChangeHistory,
  fetchTokenDetails,
  fetchUserInfo,
  fetchUserTokens,
  getEmptyUserInfo,
} from './client';
import { gafaelfawrKeys } from './query-keys';
import type { LoginInfo, TokenInfo, UserInfo } from './schemas';
import type { TokenHistoryFilters, TokenHistoryPage } from './types';

// =============================================================================
// User Info Query
// =============================================================================

/**
 * Query options for fetching user info.
 *
 * Returns empty user info on error (graceful degradation for auth checks).
 *
 * @param baseUrl - Gafaelfawr API base URL
 */
export const userInfoQueryOptions = (
  baseUrl: string = DEFAULT_GAFAELFAWR_URL,
  options?: { logger?: Logger }
) => {
  const log = options?.logger ?? defaultLogger;

  return queryOptions<UserInfo>({
    queryKey: gafaelfawrKeys.userInfo(),
    queryFn: async () => {
      try {
        return await fetchUserInfo(baseUrl);
      } catch (error) {
        // Return empty user info for unauthenticated users
        // This allows components to check isLoggedIn without handling errors
        log.error({ err: error }, 'Failed to fetch user info');
        return getEmptyUserInfo();
      }
    },
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// =============================================================================
// Login Info Query
// =============================================================================

/**
 * Query options for fetching login info (CSRF token and scopes).
 *
 * @param baseUrl - Gafaelfawr API base URL
 */
export const loginInfoQueryOptions = (
  baseUrl: string = DEFAULT_GAFAELFAWR_URL,
  options?: { logger?: Logger }
) => {
  const log = options?.logger ?? defaultLogger;

  return queryOptions<LoginInfo | null>({
    queryKey: gafaelfawrKeys.loginInfo(),
    queryFn: async () => {
      try {
        return await fetchLoginInfo(baseUrl);
      } catch (error) {
        log.error({ err: error }, 'Failed to fetch login info');
        return null;
      }
    },
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// =============================================================================
// Token List Query
// =============================================================================

/**
 * Query options for fetching a user's tokens.
 *
 * @param username - Username to fetch tokens for
 * @param baseUrl - Gafaelfawr API base URL
 */
export const userTokensQueryOptions = (
  username: string,
  baseUrl: string = DEFAULT_GAFAELFAWR_URL
) =>
  queryOptions<TokenInfo[]>({
    queryKey: gafaelfawrKeys.tokensList(username),
    queryFn: () => fetchUserTokens(username, baseUrl),
    enabled: !!username,
    staleTime: 10_000, // 10 seconds (matches SWR dedupingInterval)
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

// =============================================================================
// Token Details Query
// =============================================================================

/**
 * Query options for fetching details of a specific token.
 *
 * @param username - Username who owns the token
 * @param tokenKey - 22-character token key
 * @param baseUrl - Gafaelfawr API base URL
 */
export const tokenDetailsQueryOptions = (
  username: string,
  tokenKey: string,
  baseUrl: string = DEFAULT_GAFAELFAWR_URL
) =>
  queryOptions<TokenInfo>({
    queryKey: gafaelfawrKeys.tokenDetail(username, tokenKey),
    queryFn: () => fetchTokenDetails(username, tokenKey, baseUrl),
    enabled: !!username && !!tokenKey,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

// =============================================================================
// Token History Infinite Query
// =============================================================================

/**
 * Convert TokenHistoryFilters to a serializable object for query key.
 */
function filtersToKeyObject(
  filters: TokenHistoryFilters
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (filters.tokenType) result.tokenType = filters.tokenType;
  if (filters.token) result.token = filters.token;
  if (filters.since) result.since = filters.since.toISOString();
  if (filters.until) result.until = filters.until.toISOString();
  if (filters.ipAddress) result.ipAddress = filters.ipAddress;
  if (filters.limit) result.limit = filters.limit;

  return result;
}

/**
 * Infinite query options for fetching token change history with pagination.
 *
 * Uses cursor-based pagination from Link header.
 *
 * @param username - Username to fetch history for
 * @param filters - Filter options (excluding cursor which is handled by pagination)
 * @param baseUrl - Gafaelfawr API base URL
 */
export const tokenHistoryQueryOptions = (
  username: string,
  filters: Omit<TokenHistoryFilters, 'cursor'> = {},
  baseUrl: string = DEFAULT_GAFAELFAWR_URL
) =>
  infiniteQueryOptions({
    queryKey: gafaelfawrKeys.tokenHistoryList(
      username,
      filtersToKeyObject(filters)
    ),
    queryFn: ({ pageParam }): Promise<TokenHistoryPage> =>
      fetchTokenChangeHistory(
        username,
        { ...filters, cursor: pageParam },
        baseUrl
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: TokenHistoryPage) => lastPage.nextCursor,
    enabled: !!username,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
