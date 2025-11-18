import useSWR from 'swr';

type UserInfo = {
  username: string;
  // biome-ignore lint/suspicious/noExplicitAny: Gafaelfawr /user-info endpoint returns additional dynamic fields
  [key: string]: any;
};

type UseUserInfoReturn = {
  userInfo: UserInfo | undefined;
  // biome-ignore lint/suspicious/noExplicitAny: SWR error type is unknown
  error: any;
  isLoading: boolean;
  isLoggedIn: boolean;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

/*
 * A React hook for getting data from the `/auth/user-info` endpoint and
 * establishing in general whether the user is logged in.
 *
 * Uses SWR with webpack configuration to prevent externalization during SSR.
 */
export default function useUserInfo(): UseUserInfoReturn {
  const { data, error } = useSWR('/auth/api/v1/user-info', fetcher, {
    revalidateOnFocus: true, // Keep background refresh behavior
    revalidateOnReconnect: true, // Refresh when network reconnects
  });

  const isLoading = !error && !data;
  const isLoggedIn = !error && data && Object.hasOwn(data, 'username');

  return {
    userInfo: data,
    error,
    isLoading,
    isLoggedIn,
  };
}
