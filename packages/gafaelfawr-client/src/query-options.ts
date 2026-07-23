/**
 * TanStack Query options factories for Gafaelfawr queries.
 *
 * These factory functions return queryOptions objects that can be used
 * with useQuery or prefetched in server components.
 */
import {
  defaultLogger,
  type Logger,
  type ReportContext,
  type ReportError,
  reportingQueryFn,
} from '@lsst-sqre/api-client-core';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

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

// Re-export Logger from api-client-core so existing
// `import { Logger } from '@lsst-sqre/gafaelfawr-client'` sites keep compiling.
export type { Logger };

/**
 * Configuration for the auth-related query options
 * ({@link userInfoQueryOptions}, {@link loginInfoQueryOptions}).
 */
export type AuthQueryConfig = {
  logger?: Logger;
  /**
   * Hook invoked for report-worthy failures (contract drift, 5xx, server-side
   * network errors). Injected by the app so this package stays Sentry-agnostic;
   * see `@lsst-sqre/api-client-core`'s `reportingQueryFn`. Expected auth
   * failures (401/403) never reach this hook.
   */
  reportError?: ReportError;
  /** Context (e.g. `{ site, package }`) forwarded to `reportError`. */
  context?: ReportContext;
  /**
   * Runtime override forwarded to the error classifier: controls whether
   * network-level failures are report-worthy. Defaults to auto-detection.
   */
  isServer?: boolean;
};

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
  options?: AuthQueryConfig
) => {
  const logger = options?.logger ?? defaultLogger;
  const { reportError, context, isServer } = options ?? {};

  return queryOptions<UserInfo>({
    queryKey: gafaelfawrKeys.userInfo(),
    // Delegate to the shared reporting wrapper: it fetches, returns empty user
    // info on any failure (so components keep checking `isLoggedIn` — an auth
    // 401/403 stays a quiet, expected "not logged in"), logs every failure, and
    // invokes the injected `reportError` for report-worthy ones only (ZodError
    // contract drift, 5xx, server-side network errors). This makes an API
    // outage distinguishable from a genuine not-logged-in state.
    queryFn: reportingQueryFn<UserInfo>({
      fetchFn: () => fetchUserInfo(baseUrl),
      fallback: getEmptyUserInfo(),
      logger,
      reportError,
      context,
      isServer,
    }),
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
  options?: AuthQueryConfig
) => {
  const logger = options?.logger ?? defaultLogger;
  const { reportError, context, isServer } = options ?? {};

  return queryOptions<LoginInfo | null>({
    queryKey: gafaelfawrKeys.loginInfo(),
    // Delegate to the shared reporting wrapper: it returns null on any failure
    // (an auth 401/403 stays a quiet, expected null login info), logs every
    // failure, and reports only report-worthy ones (ZodError contract drift,
    // 5xx, server-side network errors). A silently-null `csrfToken` from a
    // non-auth failure is thus now operator-visible in Sentry.
    queryFn: reportingQueryFn<LoginInfo | null>({
      fetchFn: () => fetchLoginInfo(baseUrl),
      fallback: null,
      logger,
      reportError,
      context,
      isServer,
    }),
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
