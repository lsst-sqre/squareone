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

type ValidationError = {
  msg: string;
  type: string;
  loc: string[];
};

type TokenCreationError = {
  status: number;
  message: string; // Always a formatted string for display
  details?: {
    detail?: string | ValidationError | ValidationError[];
    [key: string]: unknown;
  };
};

/**
 * Formats error details from the Gafaelfawr API into a human-readable string.
 * Handles multiple error response formats:
 * - Array of Pydantic validation errors
 * - Single validation error object
 * - Simple string messages
 */
function formatErrorDetail(detail: unknown): string {
  // Handle array of validation errors (Pydantic format)
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        if (typeof err === 'object' && err !== null && 'msg' in err) {
          const loc =
            'loc' in err && Array.isArray(err.loc) ? err.loc.join('.') : '';
          return loc ? `${loc}: ${err.msg}` : String(err.msg);
        }
        return String(err);
      })
      .join('; ');
  }

  // Handle single validation error object
  if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
    return String(detail.msg);
  }

  // Handle string (legacy or simple error format)
  if (typeof detail === 'string') {
    return detail;
  }

  // Fallback for unknown formats
  return 'An error occurred while creating the token.';
}

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
          let errorData: Record<string, unknown> = {};
          let jsonParseFailed = false;

          try {
            errorData = await response.json();
          } catch {
            jsonParseFailed = true;
          }

          const tokenError: TokenCreationError = {
            status: response.status,
            message: jsonParseFailed
              ? response.statusText
              : formatErrorDetail(errorData.detail ?? errorData.message),
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

export type {
  CreateTokenParams,
  TokenResponse,
  TokenCreationError,
  ValidationError,
};
