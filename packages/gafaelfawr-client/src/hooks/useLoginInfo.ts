'use client';

/**
 * Hook for fetching login information including CSRF token.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { createLoginInfoQuery, type LoginInfoQuery } from '../query';
import { loginInfoQueryOptions } from '../query-options';
import type { LoginInfo } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useLoginInfo hook.
 */
export type UseLoginInfoReturn = {
  /** Login information (null if not authenticated) */
  loginInfo: LoginInfo | null;
  /** Query helper for convenient data access */
  query: LoginInfoQuery | null;
  /** CSRF token for mutations (null if not available) */
  csrfToken: string | null;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the login info */
  refetch: () => void;
};

/**
 * Fetch login information including CSRF token.
 *
 * The CSRF token is required for mutation operations (create/delete tokens).
 * This hook provides convenient access to the CSRF token and available scopes.
 *
 * @endpoint GET /auth/api/v1/login
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery.
 *                        If not provided, uses default Gafaelfawr URL.
 *
 * @example
 * ```tsx
 * function TokenActions() {
 *   const { csrfToken, query } = useLoginInfo();
 *
 *   // Use CSRF token for mutations
 *   const handleDelete = async (tokenKey: string) => {
 *     if (!csrfToken) return;
 *     await deleteToken(username, tokenKey, csrfToken);
 *   };
 *
 *   // Check available scopes
 *   const availableScopes = query?.getAvailableScopes() ?? [];
 * }
 * ```
 */
export function useLoginInfo(repertoireUrl?: string): UseLoginInfoReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    loginInfoQueryOptions(effectiveUrl)
  );

  // Create query helper if data is available
  const query = data ? createLoginInfoQuery(data) : null;

  return {
    loginInfo: data ?? null,
    query,
    csrfToken: data?.csrf ?? null,
    isLoading,
    isPending,
    error: error ?? null,
    refetch,
  };
}
