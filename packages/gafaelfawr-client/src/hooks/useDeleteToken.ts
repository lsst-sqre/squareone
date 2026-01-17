'use client';

/**
 * Hook for deleting (revoking) user tokens.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { GafaelfawrError, type TokenDeletionError } from '../errors';
import { deleteTokenMutationConfig } from '../mutation-options';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';
import { useLoginInfo } from './useLoginInfo';

/**
 * Return type for useDeleteToken hook.
 */
export type UseDeleteTokenReturn = {
  /** Delete a token */
  deleteToken: (username: string, tokenKey: string) => Promise<void>;
  /** Whether a deletion is in progress */
  isDeleting: boolean;
  /** Error from the last deletion attempt */
  error: TokenDeletionError | null;
  /** Reset the error state */
  reset: () => void;
};

/**
 * Hook for deleting (revoking) user tokens.
 *
 * Automatically handles CSRF token retrieval and cache invalidation.
 *
 * @endpoint DELETE /auth/api/v1/users/{username}/tokens/{key}
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function TokenRow({ token, username }: Props) {
 *   const { deleteToken, isDeleting, error } = useDeleteToken();
 *
 *   const handleDelete = async () => {
 *     if (confirm('Are you sure?')) {
 *       try {
 *         await deleteToken(username, token.token);
 *       } catch (err) {
 *         // Error is available in the `error` return value
 *       }
 *     }
 *   };
 *
 *   return (
 *     <tr>
 *       <td>{token.token_name ?? token.token}</td>
 *       <td>
 *         <button onClick={handleDelete} disabled={isDeleting}>
 *           {isDeleting ? 'Deleting...' : 'Delete'}
 *         </button>
 *         {error && <span className="error">{error.message}</span>}
 *       </td>
 *     </tr>
 *   );
 * }
 * ```
 */
export function useDeleteToken(repertoireUrl?: string): UseDeleteTokenReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();
  const { csrfToken } = useLoginInfo(repertoireUrl);

  const [error, setError] = useState<TokenDeletionError | null>(null);

  const mutation = useMutation({
    mutationFn: deleteTokenMutationConfig.mutationFn,
    onSuccess: (_data, variables) => {
      // Invalidate token list and history caches
      const keysToInvalidate = deleteTokenMutationConfig.getInvalidateKeys(
        variables.username,
        variables.tokenKey
      );
      keysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Remove deleted token detail from cache
      const keysToRemove = deleteTokenMutationConfig.getRemoveKeys(
        variables.username,
        variables.tokenKey
      );
      keysToRemove.forEach((key) => {
        queryClient.removeQueries({ queryKey: key });
      });

      setError(null);
    },
    onError: (err) => {
      // Format error for display
      if (err instanceof GafaelfawrError) {
        setError({
          status: err.statusCode ?? 500,
          message: err.message,
          details: err.details,
        });
      } else {
        setError({
          status: 0,
          message: err instanceof Error ? err.message : 'Network error',
        });
      }
    },
  });

  const deleteToken = useCallback(
    async (username: string, tokenKey: string): Promise<void> => {
      if (!csrfToken) {
        const err: TokenDeletionError = {
          status: 401,
          message: 'CSRF token not available. Please log in again.',
        };
        setError(err);
        throw new GafaelfawrError(err.message, err.status);
      }

      return mutation.mutateAsync({
        username,
        tokenKey,
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
    deleteToken,
    isDeleting: mutation.isPending,
    error,
    reset,
  };
}
