'use client';

/**
 * Hook for fetching a single OpenID Connect client.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { GafaelfawrError } from '../errors';
import type { OidcClientQueryConfig } from '../query-options';
import { oidcClientQueryOptions } from '../query-options';
import type { OIDCClient } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';

/**
 * Return type for useOidcClient hook.
 */
export type UseOidcClientReturn = {
  /** The client, or undefined while loading / on failure */
  client: OIDCClient | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Whether the failure was a 404 — no client with this id */
  isNotFound: boolean;
  /** Refetch the client */
  refetch: () => void;
};

/**
 * Fetch a single OpenID Connect client.
 *
 * The query stays disabled until a client id is supplied, so a detail page may
 * call it before its route params resolve.
 *
 * A caller that needs to stop fetching a client it still wants on screen — one
 * whose delete is in flight, say — passes `config.enabled: false` rather than
 * blanking the id. That keeps the query key, and so the cached client, intact
 * for as long as the pause lasts.
 *
 * @endpoint GET /auth/api/v1/oidc-clients/{client_id}
 *
 * @param clientId - Server-assigned client identifier
 * @param repertoireUrl - Optional repertoire URL for service discovery
 * @param config - Optional logging / error-reporting configuration, plus an
 *   optional `enabled` gate on fetching
 *
 * @example
 * ```tsx
 * function OidcClientDetail({ clientId }: { clientId: string }) {
 *   const { client, isLoading, isNotFound } = useOidcClient(clientId);
 *
 *   if (isLoading) return <div>Loading…</div>;
 *   if (isNotFound) return <div>No such client.</div>;
 *
 *   return <h1>{client?.description}</h1>;
 * }
 * ```
 */
export function useOidcClient(
  clientId: string | undefined,
  repertoireUrl?: string,
  config?: OidcClientQueryConfig
): UseOidcClientReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    oidcClientQueryOptions(clientId ?? '', effectiveUrl, config)
  );

  return {
    client: data,
    isLoading: isLoading && !!clientId,
    isPending,
    error: error ?? null,
    isNotFound: error instanceof GafaelfawrError && error.statusCode === 404,
    refetch,
  };
}
