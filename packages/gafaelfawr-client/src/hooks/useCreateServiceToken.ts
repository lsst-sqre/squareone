'use client';

/**
 * Hook for creating service tokens via the Gafaelfawr admin endpoint.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { DEFAULT_GAFAELFAWR_URL } from '../client';
import { GafaelfawrError, type TokenCreationError } from '../errors';
import { createServiceTokenMutationConfig } from '../mutation-options';
import type { CreateTokenResponse, Group } from '../schemas';

import { useGafaelfawrUrl } from './useGafaelfawrUrl';
import { useLoginInfo } from './useLoginInfo';

/**
 * Parameters for creating a service token.
 */
export type CreateServiceTokenParams = {
  /** Target bot username to create the service token for */
  username: string;
  /** Scopes to grant the token */
  scopes: string[];
  /** Expiration date (null for no expiration) */
  expires: Date | null;
  /** Optional human-readable name for the bot user */
  name?: string | null;
  /** Optional email for the bot user */
  email?: string | null;
  /** Optional numeric UID for the bot user */
  uid?: number | null;
  /** Optional numeric GID for the bot user */
  gid?: number | null;
  /** Optional group memberships for the bot user */
  groups?: Group[];
};

/**
 * Return type for useCreateServiceToken hook.
 */
export type UseCreateServiceTokenReturn = {
  /**
   * Create a new service token.
   * Returns the created token response (includes full token string shown only once).
   */
  createServiceToken: (
    params: CreateServiceTokenParams
  ) => Promise<CreateTokenResponse>;
  /** Whether a creation is in progress */
  isCreating: boolean;
  /** Error from the last creation attempt */
  error: TokenCreationError | null;
  /** Reset the error state */
  reset: () => void;
};

/**
 * Hook for creating service tokens via the Gafaelfawr admin endpoint.
 *
 * Mirrors {@link useCreateToken} but targets the admin
 * `POST /auth/api/v1/tokens` route (which requires the `admin:token` scope) and
 * creates `token_type: "service"` tokens for bot users. The CSRF token is
 * sourced from {@link useLoginInfo}, and the bot user's token list is
 * invalidated on success.
 *
 * @endpoint POST /auth/api/v1/tokens
 *
 * @param repertoireUrl - Optional repertoire URL for service discovery
 *
 * @example
 * ```tsx
 * function CreateServiceTokenForm() {
 *   const { createServiceToken, isCreating, error } = useCreateServiceToken();
 *
 *   const handleSubmit = async () => {
 *     const response = await createServiceToken({
 *       username: 'bot-example',
 *       scopes: ['read:tap'],
 *       expires: null,
 *     });
 *     // response.token is the new secret, shown only once
 *   };
 * }
 * ```
 */
export function useCreateServiceToken(
  repertoireUrl?: string
): UseCreateServiceTokenReturn {
  const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl ? gafaelfawrUrl : DEFAULT_GAFAELFAWR_URL;
  const queryClient = useQueryClient();
  const { csrfToken } = useLoginInfo(repertoireUrl);

  const [error, setError] = useState<TokenCreationError | null>(null);

  const mutation = useMutation({
    mutationFn: createServiceTokenMutationConfig.mutationFn,
    onSuccess: (_data, variables) => {
      // Invalidate the bot user's token list
      const keysToInvalidate =
        createServiceTokenMutationConfig.getInvalidateKeys(variables.username);
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

  const createServiceToken = useCallback(
    async (params: CreateServiceTokenParams): Promise<CreateTokenResponse> => {
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
        scopes: params.scopes,
        expires: params.expires,
        name: params.name,
        email: params.email,
        uid: params.uid,
        gid: params.gid,
        groups: params.groups,
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
    createServiceToken,
    isCreating: mutation.isPending,
    error,
    reset,
  };
}
