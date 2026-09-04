'use client';

/**
 * Hook for updating an OpenID Connect client.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import {
  GafaelfawrError,
  type OidcClientMutationError,
  toGafaelfawrErrorInfo,
} from '../errors';
import { updateOidcClientMutationConfig } from '../mutation-options';
import type { OIDCClient, OIDCClientUpdate } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';
import { useLoginInfo } from './useLoginInfo';

/**
 * Return type for useUpdateOidcClient hook.
 */
export type UseUpdateOidcClientReturn = {
  /**
   * Update a client.
   *
   * `request` carries the client's complete updatable state, not a sparse
   * diff: Gafaelfawr's PATCH requires `return_uri` and `description` on every
   * call.
   */
  updateOidcClient: (
    clientId: string,
    request: OIDCClientUpdate
  ) => Promise<OIDCClient>;
  /** Whether an update is in progress */
  isUpdating: boolean;
  /** Error from the last update attempt */
  error: OidcClientMutationError | null;
  /** Reset the error state */
  reset: () => void;
};

/**
 * Update an OpenID Connect client.
 *
 * Requires the `admin:oidc` scope. Invalidates both the deployment's client
 * list and the edited client's detail entry on success.
 *
 * @endpoint PATCH /auth/api/v1/oidc-clients/{client_id}
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function EditClientForm({ client }: { client: OIDCClient }) {
 *   const { updateOidcClient, isUpdating, error } = useUpdateOidcClient();
 *
 *   const handleSubmit = async (values: OIDCClientUpdate) => {
 *     await updateOidcClient(client.client_id, values);
 *   };
 * }
 * ```
 */
export function useUpdateOidcClient(
  repertoireUrl?: string
): UseUpdateOidcClientReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();
  const { csrfToken } = useLoginInfo(repertoireUrl);

  const [error, setError] = useState<OidcClientMutationError | null>(null);

  const mutation = useMutation({
    mutationFn: updateOidcClientMutationConfig.mutationFn,
    onSuccess: (_data, variables) => {
      for (const key of updateOidcClientMutationConfig.getInvalidateKeys(
        variables.baseUrl,
        variables.clientId
      )) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      setError(null);
    },
    onError: (err) => {
      setError(toGafaelfawrErrorInfo(err));
    },
  });

  const updateOidcClient = useCallback(
    async (
      clientId: string,
      request: OIDCClientUpdate
    ): Promise<OIDCClient> => {
      if (!csrfToken) {
        const err: OidcClientMutationError = {
          status: 401,
          message: 'CSRF token not available. Please log in again.',
        };
        setError(err);
        throw new GafaelfawrError(err.message, err.status);
      }

      return mutation.mutateAsync({
        clientId,
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
    updateOidcClient,
    isUpdating: mutation.isPending,
    error,
    reset,
  };
}
