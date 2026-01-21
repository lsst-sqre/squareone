'use client';

/**
 * Hook for creating new user tokens.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { GafaelfawrError, type TokenCreationError } from '../errors';
import { createTokenMutationConfig } from '../mutation-options';
import type { CreateTokenResponse } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';
import { useLoginInfo } from './useLoginInfo';

/**
 * Parameters for creating a token.
 */
export type CreateTokenParams = {
  /** Username to create token for */
  username: string;
  /** User-friendly name for the token */
  tokenName: string;
  /** Scopes to grant the token */
  scopes: string[];
  /** Expiration date (null for no expiration) */
  expires: Date | null;
};

/**
 * Return type for useCreateToken hook.
 */
export type UseCreateTokenReturn = {
  /**
   * Create a new token.
   * Returns the created token response (includes full token string shown only once).
   */
  createToken: (params: CreateTokenParams) => Promise<CreateTokenResponse>;
  /** Whether a creation is in progress */
  isCreating: boolean;
  /** Error from the last creation attempt */
  error: TokenCreationError | null;
  /** Reset the error state */
  reset: () => void;
};

/**
 * Hook for creating new user tokens.
 *
 * Automatically handles CSRF token retrieval and cache invalidation.
 *
 * @endpoint POST /auth/api/v1/users/{username}/tokens
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function CreateTokenForm() {
 *   const { createToken, isCreating, error, reset } = useCreateToken();
 *   const [newToken, setNewToken] = useState<string | null>(null);
 *
 *   const handleSubmit = async (formData: FormData) => {
 *     try {
 *       const response = await createToken({
 *         username: 'testuser',
 *         tokenName: formData.get('name') as string,
 *         scopes: ['read:tap'],
 *         expires: new Date(formData.get('expires') as string),
 *       });
 *       setNewToken(response.token);
 *     } catch (err) {
 *       // Error is available in the `error` return value
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       {newToken && <div>Your new token: {newToken}</div>}
 *       {/* form fields *\/}
 *       <button type="submit" disabled={isCreating}>
 *         {isCreating ? 'Creating...' : 'Create Token'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateToken(repertoireUrl?: string): UseCreateTokenReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();
  const { csrfToken } = useLoginInfo(repertoireUrl);

  const [error, setError] = useState<TokenCreationError | null>(null);

  const mutation = useMutation({
    mutationFn: createTokenMutationConfig.mutationFn,
    onSuccess: (_data, variables) => {
      // Invalidate token list and history caches
      const keysToInvalidate = createTokenMutationConfig.getInvalidateKeys(
        variables.username
      );
      keysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      setError(null);
    },
    onError: (err) => {
      // Format error for display
      if (err instanceof GafaelfawrError) {
        setError({
          status: err.statusCode ?? 500,
          message: err.message,
          details: err.details as TokenCreationError['details'],
        });
      } else {
        setError({
          status: 0,
          message: err instanceof Error ? err.message : 'Network error',
        });
      }
    },
  });

  const createToken = useCallback(
    async (params: CreateTokenParams): Promise<CreateTokenResponse> => {
      if (!csrfToken) {
        const err: TokenCreationError = {
          status: 401,
          message: 'CSRF token not available. Please log in again.',
        };
        setError(err);
        throw new GafaelfawrError(err.message, err.status);
      }

      return mutation.mutateAsync({
        username: params.username,
        tokenName: params.tokenName,
        scopes: params.scopes,
        expires: params.expires,
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
    createToken,
    isCreating: mutation.isPending,
    error,
    reset,
  };
}
