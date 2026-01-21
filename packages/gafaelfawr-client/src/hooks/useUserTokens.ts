'use client';

/**
 * Hook for fetching a user's tokens.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { createTokenListQuery, type TokenListQuery } from '../query';
import { gafaelfawrKeys } from '../query-keys';
import { userTokensQueryOptions } from '../query-options';
import type { TokenInfo } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useUserTokens hook.
 */
export type UseUserTokensReturn = {
  /** List of user tokens */
  tokens: TokenInfo[] | undefined;
  /** Query helper for convenient data access */
  query: TokenListQuery | null;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the token list */
  refetch: () => void;
  /** Invalidate the token list cache */
  invalidate: () => void;
};

/**
 * Fetch a user's tokens.
 *
 * @endpoint GET /auth/api/v1/users/{username}/tokens
 *
 * @param username - Username to fetch tokens for. Query is disabled if undefined.
 * @param repertoireUrl - Optional repertoire URL for service discovery.
 *
 * @example
 * ```tsx
 * function TokenList() {
 *   const { userInfo } = useUserInfo();
 *   const { tokens, query, isLoading } = useUserTokens(userInfo?.username);
 *
 *   if (isLoading) return <div>Loading tokens...</div>;
 *
 *   // Use query helper for filtering
 *   const userTokens = query?.getUserTokens() ?? [];
 *   const expiringTokens = query?.getExpiringSoon(7 * 24 * 60 * 60 * 1000) ?? [];
 *
 *   return (
 *     <ul>
 *       {tokens?.map(token => (
 *         <li key={token.token}>{token.token_name ?? token.token}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useUserTokens(
  username: string | undefined,
  repertoireUrl?: string
): UseUserTokensReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();

  const { data, error, isPending, isLoading, refetch } = useQuery(
    userTokensQueryOptions(username ?? '', effectiveUrl)
  );

  // Create query helper if data is available
  const query = data ? createTokenListQuery(data) : null;

  // Invalidate function for cache management
  const invalidate = () => {
    if (username) {
      queryClient.invalidateQueries({
        queryKey: gafaelfawrKeys.tokensList(username),
      });
    }
  };

  return {
    tokens: data,
    query,
    isLoading: isLoading && !!username,
    isPending,
    error: error ?? null,
    refetch,
    invalidate,
  };
}

/**
 * Extract token names from a list of tokens.
 *
 * Utility function that filters out null/undefined token names.
 *
 * @param tokens - Array of token info
 * @returns Array of non-null token names
 */
export function extractTokenNames(tokens: TokenInfo[] | undefined): string[] {
  if (!tokens) return [];
  return tokens
    .map((t) => t.token_name)
    .filter((name): name is string => name !== null && name !== undefined);
}
