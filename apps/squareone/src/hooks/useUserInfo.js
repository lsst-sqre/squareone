import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

/*
 * A React hook for getting data from the `/auth/user-info` endpoint and
 * establishing in general whether the user is logged in.
 */
function useUserInfo() {
  const { data, error } = useSWR('/auth/api/v1/user-info', fetcher);

  const isLoading = !error & !data;
  const isLoggedIn = !error && data && data.hasOwnProperty('username');

  return {
    userInfo: data,
    error,
    isLoading,
    isLoggedIn,
  };
}

export default useUserInfo;
