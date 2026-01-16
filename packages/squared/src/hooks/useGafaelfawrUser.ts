import type { Fetcher } from 'swr';
import useSWR from 'swr';
import fetch from 'unfetch';

type GafaelfawrGroup = {
  name: string;
  id?: number;
};

type GafaelfawrApiQuota = {
  [key: string]: number;
};

type GafaelfawrNotebookQuota = {
  cpu: number;
  memory: number;
  spawn: boolean;
};

type GafaelfawrTapQuota = {
  concurrent: number;
};

type GafaelfawrQuota = {
  api: GafaelfawrApiQuota;
  notebook: GafaelfawrNotebookQuota | null;
  tap: { [key: string]: GafaelfawrTapQuota };
};

type GafaelfawrUser = {
  username: string;
  name?: string;
  email?: string;
  uid?: number;
  gid?: number;
  groups?: GafaelfawrGroup[];
  quota?: GafaelfawrQuota | null;
};

const fetcher: Fetcher<GafaelfawrUser, string> = (url: string) =>
  fetch(url).then((res) => res.json());

/**
 * A React hook for getting data from Gafaelfawr's `/auth/user-info` endpoint
 * and establishing in general whether the user is logged in.
 */
const useGafaelfawrUser = () => {
  const { data, error, isLoading, isValidating } = useSWR(
    '/auth/api/v1/user-info',
    fetcher
  );

  const isLoggedIn = !error && data && Object.hasOwn(data, 'username');

  return {
    user: data,
    isLoading,
    isValidating,
    isLoggedIn,
    error,
  };
};

export default useGafaelfawrUser;
export type {
  GafaelfawrUser,
  GafaelfawrQuota,
  GafaelfawrNotebookQuota,
  GafaelfawrApiQuota,
  GafaelfawrTapQuota,
  GafaelfawrGroup,
};
