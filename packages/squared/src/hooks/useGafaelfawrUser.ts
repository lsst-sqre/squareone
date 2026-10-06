import type { Fetcher } from 'swr';
import useSWR from 'swr';

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
 *
 * @deprecated Use `useUserInfo` from `@lsst-sqre/gafaelfawr-client` instead.
 * This hook makes its own SWR request to a fixed `/auth/api/v1/user-info`
 * path, so it cannot share (or be server-rendered from) the TanStack Query
 * user-info entry an app prefetches and hydrates, and it does not validate the
 * response or report failures.
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
  GafaelfawrApiQuota,
  GafaelfawrGroup,
  GafaelfawrNotebookQuota,
  GafaelfawrQuota,
  GafaelfawrTapQuota,
  GafaelfawrUser,
};
