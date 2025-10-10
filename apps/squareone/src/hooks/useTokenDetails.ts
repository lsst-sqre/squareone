import useSWR, { type KeyedMutator } from 'swr';
import type { TokenInfo } from './useUserTokens';

type UseTokenDetailsReturn = {
  token: TokenInfo | undefined;
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<TokenInfo>;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });

/**
 * A React hook for fetching details for a single token from the
 * `/auth/api/v1/users/{username}/tokens/{key}` endpoint.
 *
 * Uses SWR for data fetching and caching with background revalidation.
 *
 * @param username - The username to fetch token for
 * @param tokenKey - The token key (22 characters) to fetch
 * @returns Object containing token data, loading state, error state, and mutate function
 */
export default function useTokenDetails(
  username: string | undefined,
  tokenKey: string | undefined
): UseTokenDetailsReturn {
  const { data, error, mutate } = useSWR(
    username && tokenKey
      ? `/auth/api/v1/users/${username}/tokens/${tokenKey}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Cache for 10 seconds to balance performance and freshness
      // We can use explicit mutate() calls when immediate updates are needed
      dedupingInterval: 10000,
    }
  );

  const isLoading = !error && !data && !!username && !!tokenKey;

  return {
    token: data,
    error,
    isLoading,
    mutate,
  };
}
