'use client';

/**
 * Hook for fetching details of a specific token.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { tokenDetailsQueryOptions } from '../query-options';
import type { TokenInfo } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useTokenDetails hook.
 */
export type UseTokenDetailsReturn = {
  /** Token details */
  token: TokenInfo | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the token details */
  refetch: () => void;
};

/**
 * Fetch details of a specific token.
 *
 * The query is only enabled when both username and tokenKey are provided.
 *
 * @endpoint GET /auth/api/v1/users/{username}/tokens/{key}
 *
 * @param username - Username who owns the token
 * @param tokenKey - 22-character token key
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function TokenDetailPage({ username, tokenKey }: Props) {
 *   const { token, isLoading, error } = useTokenDetails(username, tokenKey);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!token) return <div>Token not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{token.token_name ?? 'Unnamed Token'}</h1>
 *       <p>Type: {token.token_type}</p>
 *       <p>Scopes: {token.scopes.join(', ')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenDetails(
  username: string | undefined,
  tokenKey: string | undefined,
  repertoireUrl?: string
): UseTokenDetailsReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    tokenDetailsQueryOptions(username ?? '', tokenKey ?? '', effectiveUrl)
  );

  return {
    token: data,
    isLoading: isLoading && !!username && !!tokenKey,
    isPending,
    error: error ?? null,
    refetch,
  };
}
