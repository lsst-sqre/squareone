/**
 * TanStack Query mutation configurations for Gafaelfawr.
 *
 * These are used with useMutation to handle token creation and deletion.
 */
import { createToken, deleteToken } from './client';
import { gafaelfawrKeys } from './query-keys';
import type { CreateTokenResponse } from './schemas';
import type { CreateTokenVariables, DeleteTokenVariables } from './types';

/**
 * Mutation options for creating a new token.
 *
 * Usage with useMutation:
 * ```ts
 * const mutation = useMutation(createTokenMutationOptions(queryClient));
 * mutation.mutate({ username, tokenName, scopes, expires, csrfToken, baseUrl });
 * ```
 */
export const createTokenMutationConfig = {
  mutationFn: async (
    variables: CreateTokenVariables
  ): Promise<CreateTokenResponse> => {
    const { username, tokenName, scopes, expires, csrfToken, baseUrl } =
      variables;

    // Convert Date to epoch seconds for API
    const expiresEpoch = expires ? Math.floor(expires.getTime() / 1000) : null;

    return createToken(
      username,
      {
        token_name: tokenName,
        scopes,
        expires: expiresEpoch,
      },
      csrfToken,
      baseUrl
    );
  },

  /**
   * Returns mutation keys to invalidate on success.
   * The caller should use these to invalidate the query cache.
   */
  getInvalidateKeys: (username: string) => [
    gafaelfawrKeys.tokensList(username),
    gafaelfawrKeys.tokenHistory(),
  ],
};

/**
 * Mutation options for deleting (revoking) a token.
 *
 * Usage with useMutation:
 * ```ts
 * const mutation = useMutation(deleteTokenMutationOptions(queryClient));
 * mutation.mutate({ username, tokenKey, csrfToken, baseUrl });
 * ```
 */
export const deleteTokenMutationConfig = {
  mutationFn: async (variables: DeleteTokenVariables): Promise<void> => {
    const { username, tokenKey, csrfToken, baseUrl } = variables;
    return deleteToken(username, tokenKey, csrfToken, baseUrl);
  },

  /**
   * Returns mutation keys to invalidate on success.
   * The caller should use these to invalidate the query cache.
   */
  getInvalidateKeys: (username: string, tokenKey: string) => [
    gafaelfawrKeys.tokensList(username),
    gafaelfawrKeys.tokenDetail(username, tokenKey),
    gafaelfawrKeys.tokenHistory(),
  ],

  /**
   * Returns query keys to remove from cache on success.
   * Used for removing the deleted token's detail from cache.
   */
  getRemoveKeys: (username: string, tokenKey: string) => [
    gafaelfawrKeys.tokenDetail(username, tokenKey),
  ],
};
