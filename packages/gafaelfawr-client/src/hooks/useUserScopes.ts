'use client';

/**
 * Hook for the signed-in user's Gafaelfawr scopes.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { type AuthQueryConfig, userScopesQueryOptions } from '../query-options';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useUserScopes hook.
 */
export type UseUserScopesReturn = {
  /**
   * The signed-in user's scopes; `undefined` for an anonymous visitor, while
   * loading, or when they could not be determined.
   */
  scopes: readonly string[] | undefined;
  /** Whether the user holds `scope` (false while scopes are unknown) */
  hasScope: (scope: string) => boolean;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the scopes */
  refetch: () => void;
};

/**
 * The signed-in user's scopes, for gating what the UI shows.
 *
 * In the browser the scopes come from login info (`GET /auth/api/v1/login`),
 * shared with every `useLoginInfo` observer rather than fetched again. The
 * query has its own key, though, so a server render can hydrate it from the
 * delegated token's `token-info` on a GafaelfawrIngress route, where login
 * info itself cannot be fetched. See `userScopesQueryOptions`.
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery.
 *                        If not provided, uses default Gafaelfawr URL.
 * @param config - Optional query config. Pass `reportError` / `context` to
 *                 route report-worthy failures to an injected reporter; auth
 *                 401/403 stay quiet.
 *
 * @example
 * ```tsx
 * function PortalLink() {
 *   const { hasScope } = useUserScopes(repertoireUrl);
 *   if (!hasScope('exec:portal')) return null;
 *   return <a href="/portal">Portal</a>;
 * }
 * ```
 */
export function useUserScopes(
  repertoireUrl?: string,
  config?: AuthQueryConfig
): UseUserScopesReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    userScopesQueryOptions(effectiveUrl, config)
  );

  const scopes = data ?? undefined;

  return {
    scopes,
    hasScope: (scope) => scopes?.includes(scope) ?? false,
    isLoading,
    isPending,
    error: error ?? null,
    refetch,
  };
}
