'use client';

/**
 * Hook for listing a deployment's OpenID Connect clients.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { isOidcNotConfiguredError } from '../errors';
import { gafaelfawrKeys } from '../query-keys';
import type { AuthQueryConfig } from '../query-options';
import { oidcClientsQueryOptions } from '../query-options';
import type { OIDCClient } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useOidcClients hook.
 */
export type UseOidcClientsReturn = {
  /** Registered OpenID Connect clients */
  clients: OIDCClient[] | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /**
   * Whether Gafaelfawr reports no OpenID Connect server in this environment.
   *
   * Distinct from a generic failure: the OIDC server is an optional Phalanx
   * feature, so this is a "not enabled here" state rather than an error worth
   * alarming about.
   */
  isNotConfigured: boolean;
  /** Refetch the client list */
  refetch: () => void;
  /** Invalidate the client list cache */
  invalidate: () => void;
};

/**
 * List the OpenID Connect clients registered with Gafaelfawr.
 *
 * Requires the `admin:oidc` scope; without it the query fails with a 403, which
 * surfaces through `error` rather than being swallowed.
 *
 * @endpoint GET /auth/api/v1/oidc-clients
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 * @param config - Optional logging / error-reporting configuration
 *
 * @example
 * ```tsx
 * function OidcClientsTable() {
 *   const { clients, isLoading, isNotConfigured, error } = useOidcClients();
 *
 *   if (isLoading) return <div>Loading…</div>;
 *   if (isNotConfigured) return <div>OpenID Connect is not enabled here.</div>;
 *   if (error) return <div>{error.message}</div>;
 *
 *   return <ul>{clients?.map((c) => <li key={c.client_id}>{c.description}</li>)}</ul>;
 * }
 * ```
 */
export function useOidcClients(
  repertoireUrl?: string,
  config?: AuthQueryConfig
): UseOidcClientsReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();

  const { data, error, isPending, isLoading, refetch } = useQuery(
    oidcClientsQueryOptions(effectiveUrl, config)
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: gafaelfawrKeys.oidcClients(effectiveUrl),
    });
  };

  return {
    clients: data,
    isLoading,
    isPending,
    error: error ?? null,
    isNotConfigured: isOidcNotConfiguredError(error),
    refetch,
    invalidate,
  };
}
