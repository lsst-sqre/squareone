import { useState, useCallback } from 'react';

type CreateTokenParams = {
  username: string;
  csrf: string;
  tokenName: string;
  scopes: string[];
  expires: string | null;
};

type TokenResponse = {
  token: string;
};

type TokenCreationError = {
  status: number;
  message: string;
  details?: unknown;
};

type UseTokenCreationReturn = {
  createToken: (params: CreateTokenParams) => Promise<TokenResponse>;
  isCreating: boolean;
  error?: TokenCreationError;
  reset: () => void;
};

export default function useTokenCreation(): UseTokenCreationReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<TokenCreationError | undefined>();

  const createToken = useCallback(
    async (params: CreateTokenParams): Promise<TokenResponse> => {
      setIsCreating(true);
      setError(undefined);

      const expiresEpoch = params.expires
        ? Math.floor(new Date(params.expires).getTime() / 1000)
        : null;

      try {
        const response = await fetch(
          `/auth/api/v1/users/${params.username}/tokens`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': params.csrf,
            },
            body: JSON.stringify({
              token_name: params.tokenName,
              scopes: params.scopes,
              expires: expiresEpoch,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const tokenError: TokenCreationError = {
            status: response.status,
            message:
              errorData.detail || errorData.message || response.statusText,
            details: errorData,
          };
          setError(tokenError);
          throw tokenError;
        }

        const data = await response.json();
        setIsCreating(false);
        return data;
      } catch (err) {
        setIsCreating(false);
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          typeof err.status === 'number'
        ) {
          throw err;
        }
        const networkError: TokenCreationError = {
          status: 0,
          message: 'Network error. Please check your connection and try again.',
        };
        setError(networkError);
        throw networkError;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(undefined);
    setIsCreating(false);
  }, []);

  return {
    createToken,
    isCreating,
    error,
    reset,
  };
}

export type { CreateTokenParams, TokenResponse, TokenCreationError };
