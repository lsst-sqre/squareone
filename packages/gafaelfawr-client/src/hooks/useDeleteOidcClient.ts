'use client';

/**
 * Hook for deleting an OpenID Connect client.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import {
  GafaelfawrError,
  type OidcClientMutationError,
  toGafaelfawrErrorInfo,
} from '../errors';
import { deleteOidcClientMutationConfig } from '../mutation-options';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';
import { useLoginInfo } from './useLoginInfo';

/**
 * Return type for useDeleteOidcClient hook.
 */
export type UseDeleteOidcClientReturn = {
  /** Delete a client */
  deleteOidcClient: (clientId: string) => Promise<void>;
  /** Whether a deletion is in progress */
  isDeleting: boolean;
  /** Error from the last deletion attempt */
  error: OidcClientMutationError | null;
  /** Reset the error state */
  reset: () => void;
};

/**
 * Delete an OpenID Connect client.
 *
 * Requires the `admin:oidc` scope. On success the deployment's client list is
 * invalidated and the deleted client's detail entry is dropped from the cache
 * (refetching it would only 404).
 *
 * @endpoint DELETE /auth/api/v1/oidc-clients/{client_id}
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function DeleteClientButton({ clientId }: { clientId: string }) {
 *   const { deleteOidcClient, isDeleting, error } = useDeleteOidcClient();
 *
 *   return (
 *     <button onClick={() => deleteOidcClient(clientId)} disabled={isDeleting}>
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteOidcClient(
  repertoireUrl?: string
): UseDeleteOidcClientReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();
  const { csrfToken } = useLoginInfo(repertoireUrl);

  const [error, setError] = useState<OidcClientMutationError | null>(null);

  const mutation = useMutation({
    mutationFn: deleteOidcClientMutationConfig.mutationFn,
    onSuccess: (_data, variables) => {
      for (const key of deleteOidcClientMutationConfig.getInvalidateKeys(
        variables.baseUrl
      )) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      for (const key of deleteOidcClientMutationConfig.getRemoveKeys(
        variables.baseUrl,
        variables.clientId
      )) {
        queryClient.removeQueries({ queryKey: key });
      }
      setError(null);
    },
    onError: (err) => {
      setError(toGafaelfawrErrorInfo(err));
    },
  });

  const deleteOidcClient = useCallback(
    async (clientId: string): Promise<void> => {
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
    deleteOidcClient,
    isDeleting: mutation.isPending,
    error,
    reset,
  };
}
