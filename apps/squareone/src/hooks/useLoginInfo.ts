import useSWR from 'swr';

type Scope = {
  name: string;
  description: string;
};

type LoginInfo = {
  csrf: string;
  username: string;
  scopes: string[];
  config: {
    scopes: Scope[];
  };
};

type UseLoginInfoReturn = {
  loginInfo?: LoginInfo;
  error?: Error;
  isLoading: boolean;
  mutate: () => void;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

/**
 * A React hook for getting CSRF token and available scopes from the
 * `/auth/api/v1/login` endpoint. This hook runs client-side only as it
 * requires the user's authentication cookie to access the endpoint.
 *
 * Uses SWR for data fetching and caching, similar to useUserInfo and
 * useGafaelfawrUser hooks.
 */
export default function useLoginInfo(): UseLoginInfoReturn {
  const { data, error, mutate } = useSWR('/auth/api/v1/login', fetcher, {
    revalidateOnFocus: true, // Keep background refresh behavior
    revalidateOnReconnect: true, // Refresh when network reconnects
  });

  const isLoading = !error && !data;

  return {
    loginInfo: data,
    error,
    isLoading,
    mutate,
  };
}

export type { LoginInfo, Scope };
