/**
 * TanStack Query mutation configurations for Gafaelfawr.
 *
 * These are used with useMutation to handle token creation and deletion.
 */
import {
  createOidcClient,
  createServiceToken,
  createToken,
  deleteOidcClient,
  deleteToken,
  updateOidcClient,
} from './client';
import { gafaelfawrKeys } from './query-keys';
import type {
  AdminTokenRequest,
  CreateTokenResponse,
  OIDCClient,
  OIDCClientWithSecret,
} from './schemas';
import type {
  CreateOidcClientVariables,
  CreateServiceTokenVariables,
  CreateTokenVariables,
  DeleteOidcClientVariables,
  DeleteTokenVariables,
  UpdateOidcClientVariables,
} from './types';

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
 * Mutation options for creating a new service token via the admin endpoint.
 *
 * Mirrors {@link createTokenMutationConfig} but targets the admin
 * `POST {base}/tokens` route (the bot username travels in the body) and forwards
 * optional identity metadata for the bot user. On success, only the bot user's
 * token list needs invalidating — the admin's own token history is unaffected.
 *
 * Usage with useMutation:
 * ```ts
 * const mutation = useMutation({
 *   mutationFn: createServiceTokenMutationConfig.mutationFn,
 * });
 * mutation.mutate({ username, scopes, expires, csrfToken, baseUrl });
 * ```
 */
export const createServiceTokenMutationConfig = {
  mutationFn: async (
    variables: CreateServiceTokenVariables
  ): Promise<CreateTokenResponse> => {
    const {
      username,
      scopes,
      expires,
      name,
      email,
      uid,
      gid,
      groups,
      csrfToken,
      baseUrl,
    } = variables;

    // Convert Date to epoch seconds for API
    const expiresEpoch = expires ? Math.floor(expires.getTime() / 1000) : null;

    const request: AdminTokenRequest = {
      username,
      token_type: 'service',
      scopes,
      expires: expiresEpoch,
      // Only forward optional metadata that was explicitly supplied.
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(uid !== undefined ? { uid } : {}),
      ...(gid !== undefined ? { gid } : {}),
      ...(groups !== undefined ? { groups } : {}),
    };

    return createServiceToken(request, csrfToken, baseUrl);
  },

  /**
   * Returns mutation keys to invalidate on success.
   * The caller should use these to invalidate the query cache.
   */
  getInvalidateKeys: (username: string) => [
    gafaelfawrKeys.tokensList(username),
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

/**
 * Mutation options for registering a new OpenID Connect client.
 *
 * The resolved value carries the one-time `client_secret`; callers must show it
 * to the operator immediately, since Gafaelfawr never discloses it again and
 * has no rotate endpoint.
 */
export const createOidcClientMutationConfig = {
  mutationFn: async (
    variables: CreateOidcClientVariables
  ): Promise<OIDCClientWithSecret> => {
    const { request, csrfToken, baseUrl } = variables;
    return createOidcClient(request, csrfToken, baseUrl);
  },

  /** Query keys to invalidate on success: the deployment's client list. */
  getInvalidateKeys: (baseUrl: string) => [gafaelfawrKeys.oidcClients(baseUrl)],
};

/**
 * Mutation options for updating an OpenID Connect client.
 *
 * Invalidates both the list and this client's detail entry, since the detail
 * key is a sibling of the list key rather than a child of it.
 */
export const updateOidcClientMutationConfig = {
  mutationFn: async (
    variables: UpdateOidcClientVariables
  ): Promise<OIDCClient> => {
    const { clientId, request, csrfToken, baseUrl } = variables;
    return updateOidcClient(clientId, request, csrfToken, baseUrl);
  },

  /** Query keys to invalidate on success. */
  getInvalidateKeys: (baseUrl: string, clientId: string) => [
    gafaelfawrKeys.oidcClients(baseUrl),
    gafaelfawrKeys.oidcClient(baseUrl, clientId),
  ],
};

/**
 * Mutation options for deleting an OpenID Connect client.
 *
 * The deleted client's detail entry is removed rather than invalidated — a
 * refetch would only 404 — while the list is invalidated so it refetches.
 */
export const deleteOidcClientMutationConfig = {
  mutationFn: async (variables: DeleteOidcClientVariables): Promise<void> => {
    const { clientId, csrfToken, baseUrl } = variables;
    return deleteOidcClient(clientId, csrfToken, baseUrl);
  },

  /** Query keys to invalidate on success. */
  getInvalidateKeys: (baseUrl: string) => [gafaelfawrKeys.oidcClients(baseUrl)],

  /** Query keys to drop from the cache on success. */
  getRemoveKeys: (baseUrl: string, clientId: string) => [
    gafaelfawrKeys.oidcClient(baseUrl, clientId),
  ],
};
