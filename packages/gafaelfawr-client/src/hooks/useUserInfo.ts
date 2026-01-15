'use client';

/**
 * Hook for fetching and accessing user information.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { createUserInfoQuery, type UserInfoQuery } from '../query';
import { userInfoQueryOptions } from '../query-options';
import type { UserInfo } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useUserInfo hook.
 */
export type UseUserInfoReturn = {
  /** User information (empty if not authenticated) */
  userInfo: UserInfo | undefined;
  /** Query helper for convenient data access */
  query: UserInfoQuery | null;
  /** Whether the user is logged in */
  isLoggedIn: boolean;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the user info */
  refetch: () => void;
};

/**
 * Fetch and access user information.
 *
 * This hook determines authentication status by checking if the returned
 * user info has a username. Returns empty user info for unauthenticated users
 * (graceful degradation).
 *
 * @endpoint GET /auth/api/v1/user-info
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery.
 *                        If not provided, uses default Gafaelfawr URL.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { userInfo, isLoggedIn, isLoading } = useUserInfo();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isLoggedIn) return <div>Please log in</div>;
 *
 *   return <div>Hello, {userInfo?.name}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With repertoire service discovery
 * function MyComponent() {
 *   const repertoireUrl = useRepertoireUrl();
 *   const { userInfo, query } = useUserInfo(repertoireUrl);
 *
 *   // Use query helper for convenient access
 *   const canSpawn = query?.canSpawnNotebook() ?? false;
 * }
 * ```
 */
export function useUserInfo(repertoireUrl?: string): UseUserInfoReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    userInfoQueryOptions(effectiveUrl)
  );

  // Determine if user is logged in based on username presence
  const isLoggedIn = !!data?.username;

  // Create query helper if data is available
  const query = data ? createUserInfoQuery(data) : null;

  return {
    userInfo: data,
    query,
    isLoggedIn,
    isLoading,
    isPending,
    error: error ?? null,
    refetch,
  };
}
