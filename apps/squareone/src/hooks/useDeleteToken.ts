import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import useLoginInfo from './useLoginInfo';

type TokenDeletionError = {
  status: number;
  message: string;
  details?: unknown;
};

type UseDeleteTokenReturn = {
  deleteToken: (username: string, key: string) => Promise<void>;
  isDeleting: boolean;
  error?: TokenDeletionError;
};

/**
 * A React hook for deleting user tokens via the DELETE /auth/api/v1/users/{username}/tokens/{key} endpoint.
 *
 * Handles CSRF token authentication and SWR cache mutation on success.
 *
 * @returns Object containing deleteToken function, loading state, and error state
 */
export default function useDeleteToken(): UseDeleteTokenReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<TokenDeletionError | undefined>();
  const { loginInfo } = useLoginInfo();

  const deleteToken = useCallback(
    async (username: string, key: string): Promise<void> => {
      setIsDeleting(true);
      setError(undefined);

      const csrfToken = loginInfo?.csrf;

      if (!csrfToken) {
        const authError: TokenDeletionError = {
          status: 401,
          message: 'Authentication required. Please log in again.',
        };
        setError(authError);
        setIsDeleting(false);
        throw authError;
      }

      try {
        const response = await fetch(
          `/auth/api/v1/users/${username}/tokens/${key}`,
          {
            method: 'DELETE',
            headers: {
              'X-CSRF-Token': csrfToken,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          let message: string;
          switch (response.status) {
            case 401:
              message = 'Authentication required. Please log in again.';
              break;
            case 403:
              message = "You don't have permission to delete this token.";
              break;
            case 404:
              message = 'Token not found. It may have already been deleted.';
              break;
            case 422:
              message = 'Invalid request. Please try again.';
              break;
            default:
              message =
                errorData.detail || errorData.message || response.statusText;
          }

          const tokenError: TokenDeletionError = {
            status: response.status,
            message,
            details: errorData,
          };
          setError(tokenError);
          setIsDeleting(false);
          throw tokenError;
        }

        // Success - mutate the useUserTokens cache to trigger a re-fetch
        await mutate(`/auth/api/v1/users/${username}/tokens`);

        setIsDeleting(false);
      } catch (err) {
        setIsDeleting(false);
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          typeof err.status === 'number'
        ) {
          throw err;
        }
        const networkError: TokenDeletionError = {
          status: 0,
          message: 'Failed to delete token. Please check your connection.',
        };
        setError(networkError);
        throw networkError;
      }
    },
    [loginInfo]
  );

  return {
    deleteToken,
    isDeleting,
    error,
  };
}

export type { TokenDeletionError };
