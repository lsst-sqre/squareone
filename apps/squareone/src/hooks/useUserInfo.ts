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
 */
export default function useUserInfo(): UseUserInfoReturn {
  const isServer = typeof window === 'undefined';

  // Always call useSWR but pass null as key on server to disable it
  const { data, error } = useSWR(
    isServer ? null : '/auth/api/v1/user-info',
    fetcher
  );

  // Return safe defaults on server side
  if (isServer) {
    return {
      userInfo: undefined,
      error: null,
      isLoading: false,
      isLoggedIn: false,
    };
  }

  const isLoading = !error && !data;
  const isLoggedIn = !error && data && data.hasOwnProperty('username');

  return {
    userInfo: data,
    error,
    isLoading,
    isLoggedIn,
  };
}
