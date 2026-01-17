/**
 * TanStack Query key factory for Gafaelfawr queries.
 *
 * Provides a hierarchical key structure for cache management:
 * - ['gafaelfawr'] - Root key for all Gafaelfawr data
 * - ['gafaelfawr', 'user-info'] - User info query
 * - ['gafaelfawr', 'tokens', 'list', username] - Token list for user
 * - etc.
 */

/**
 * Query key factory for Gafaelfawr queries.
 *
 * Usage:
 * ```ts
 * // Invalidate all Gafaelfawr data
 * queryClient.invalidateQueries({ queryKey: gafaelfawrKeys.all });
 *
 * // Invalidate all token data
 * queryClient.invalidateQueries({ queryKey: gafaelfawrKeys.tokens() });
 *
 * // Invalidate specific user's tokens
 * queryClient.invalidateQueries({ queryKey: gafaelfawrKeys.tokensList('testuser') });
 * ```
 */
export const gafaelfawrKeys = {
  /** Root key for all Gafaelfawr data */
  all: ['gafaelfawr'] as const,

  /** User info query key */
  userInfo: () => [...gafaelfawrKeys.all, 'user-info'] as const,

  /** Login info (CSRF) query key */
  loginInfo: () => [...gafaelfawrKeys.all, 'login-info'] as const,

  /** Root key for all token data */
  tokens: () => [...gafaelfawrKeys.all, 'tokens'] as const,

  /** Token list for a specific user */
  tokensList: (username: string) =>
    [...gafaelfawrKeys.tokens(), 'list', username] as const,

  /** Token detail for a specific token */
  tokenDetail: (username: string, tokenKey: string) =>
    [...gafaelfawrKeys.tokens(), 'detail', username, tokenKey] as const,

  /** Root key for token history data */
  tokenHistory: () => [...gafaelfawrKeys.all, 'token-history'] as const,

  /**
   * Token history list for a user with optional filters.
   *
   * The filters object is included in the key to ensure different
   * filter combinations are cached separately.
   */
  tokenHistoryList: (username: string, filters?: Record<string, unknown>) =>
    [...gafaelfawrKeys.tokenHistory(), username, filters ?? {}] as const,
};

/**
 * Type helper for query key types.
 * Useful for typing queryKey parameters in custom hooks.
 */
export type GafaelfawrQueryKeys = typeof gafaelfawrKeys;
