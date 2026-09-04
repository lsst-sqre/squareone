'use client';

/**
 * Hook for registering a new OpenID Connect client.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import {
  GafaelfawrError,
  type OidcClientMutationError,
  toGafaelfawrErrorInfo,
} from '../errors';
import { createOidcClientMutationConfig } from '../mutation-options';
import type { OIDCClientUpdate, OIDCClientWithSecret } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';
import { useLoginInfo } from './useLoginInfo';

/**
 * Return type for useCreateOidcClient hook.
 */
export type UseCreateOidcClientReturn = {
  /**
   * Register a new client.
   *
   * Resolves with the created client **including its `client_secret`** — the
   * only time Gafaelfawr discloses it. Show it to the operator immediately.
   */
  createOidcClient: (
    request: OIDCClientUpdate
  ) => Promise<OIDCClientWithSecret>;
  /** Whether a creation is in progress */
  isCreating: boolean;
  /** Error from the last creation attempt */
  error: OidcClientMutationError | null;
  /** Reset the error state */
  reset: () => void;
};

/**
 * Register a new OpenID Connect client.
 *
 * Requires the `admin:oidc` scope. The CSRF token is sourced from
 * {@link useLoginInfo}, and the deployment's client list is invalidated on
 * success.
 *
 * @endpoint POST /auth/api/v1/oidc-clients
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function NewClientForm() {
 *   const { createOidcClient, isCreating, error } = useCreateOidcClient();
 *
 *   const handleSubmit = async () => {
 *     const created = await createOidcClient({
 *       return_uri: 'https://rp.example.org/callback',
 *       description: 'Example relying party',
 *     });
 *     // created.client_secret is shown once and never again
 *   };
 * }
 * ```
 */
export function useCreateOidcClient(
  repertoireUrl?: string
): UseCreateOidcClientReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();
  const { csrfToken } = useLoginInfo(repertoireUrl);

  const [error, setError] = useState<OidcClientMutationError | null>(null);

  const mutation = useMutation({
    mutationFn: createOidcClientMutationConfig.mutationFn,
    onSuccess: (_data, variables) => {
      for (const key of createOidcClientMutationConfig.getInvalidateKeys(
        variables.baseUrl
      )) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      setError(null);
    },
    onError: (err) => {
      setError(toGafaelfawrErrorInfo(err));
    },
  });

  const createOidcClient = useCallback(
    async (request: OIDCClientUpdate): Promise<OIDCClientWithSecret> => {
      if (!csrfToken) {
        const err: OidcClientMutationError = {
          status: 401,
          message: 'CSRF token not available. Please log in again.',
        };
        setError(err);
        throw new GafaelfawrError(err.message, err.status);
      }

      return mutation.mutateAsync({
        request,
        csrfToken,
        baseUrl: effectiveUrl,
      });
    },
    [csrfToken, effectiveUrl, mutation]
  );

  const reset = useCallback(() => {
    setError(null);
    mutation.reset();
  }, [mutation]);

  return {
    createOidcClient,
    isCreating: mutation.isPending,
    error,
    reset,
  };
}
