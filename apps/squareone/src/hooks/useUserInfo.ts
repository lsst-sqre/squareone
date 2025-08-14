import useSWR from 'swr';

type UserInfo = {
  username: string;
  [key: string]: any;
};

type UseUserInfoReturn = {
  userInfo: UserInfo | undefined;
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
  const isLoggedIn = !error && data && data.hasOwnProperty('username');

  return {
    userInfo: data,
    error,
    isLoading,
    isLoggedIn,
  };
}
