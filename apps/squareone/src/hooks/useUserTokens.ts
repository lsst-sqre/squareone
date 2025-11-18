import useSWR, { type KeyedMutator } from 'swr';

export type TokenInfo = {
  username: string;
  token_type: 'session' | 'user' | 'notebook' | 'internal' | 'service' | 'oidc';
  service: string | null;
  scopes: string[];
  created?: number;
  expires?: number; // Optional field - omitted means no expiration
  token: string;
  token_name?: string; // Optional field - omitted for some token types
  last_used?: number; // Optional field - not currently implemented by API
  parent: string | null;
};

type UseUserTokensReturn = {
  tokens: TokenInfo[] | undefined;
  // biome-ignore lint/suspicious/noExplicitAny: SWR error type is unknown
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<TokenInfo[]>;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });

/**
 * A React hook for fetching user tokens from the `/auth/api/v1/users/{username}/tokens` endpoint.
 *
 * Uses SWR for data fetching and caching with background revalidation.
 *
 * @param username - The username to fetch tokens for
 * @returns Object containing tokens data, loading state, error state, and mutate function
 */
export default function useUserTokens(username?: string): UseUserTokensReturn {
  const { data, error, mutate } = useSWR(
    username ? `/auth/api/v1/users/${username}/tokens` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Cache for 10 seconds to balance performance and freshness
      // We can use explicit mutate() calls when immediate updates are needed
      dedupingInterval: 10000,
    }
  );

  const isLoading = !error && !data && !!username;

  return {
    tokens: data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * Extract token names from a list of tokens, filtering out null values
 *
 * @param tokens - Array of TokenInfo objects
 * @returns Array of token names (strings only)
 */
export function extractTokenNames(tokens: TokenInfo[] | undefined): string[] {
  if (!tokens) return [];

  return tokens
    .map((token) => token.token_name)
    .filter((name): name is string => name !== null);
}
