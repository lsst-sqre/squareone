/**
 * Gafaelfawr API client functions.
 *
 * All functions accept a baseUrl parameter that should be obtained from
 * repertoire service discovery (e.g., 'https://data.lsst.cloud/auth/api/v1').
 */
import { z } from 'zod';

import {
  formatValidationError,
  GafaelfawrError,
  OidcNotConfiguredError,
} from './errors';
import {
  type AdminTokenRequest,
  type CreateTokenRequest,
  type CreateTokenResponse,
  CreateTokenResponseSchema,
  ErrorResponseSchema,
  type LoginInfo,
  LoginInfoSchema,
  type OIDCClient,
  OIDCClientSchema,
  type OIDCClientUpdate,
  type OIDCClientWithSecret,
  OIDCClientWithSecretSchema,
  type TokenChangeHistoryEntry,
  TokenChangeHistoryEntrySchema,
  type TokenInfo,
  TokenInfoSchema,
  type UserInfo,
  UserInfoSchema,
} from './schemas';
import type { TokenHistoryFilters, TokenHistoryPage } from './types';

// =============================================================================
// User Info
// =============================================================================

/**
 * Fetch current user information.
 *
 * @param baseUrl - Gafaelfawr API base URL (e.g., '/auth/api/v1')
 * @returns User information if authenticated
 * @throws GafaelfawrError if request fails or user is not authenticated
 */
export async function fetchUserInfo(baseUrl: string): Promise<UserInfo> {
  const url = `${normalizeUrl(baseUrl)}/user-info`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new GafaelfawrError(
      `Failed to fetch user info: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return UserInfoSchema.parse(data);
}

/**
 * Get empty user info structure for error fallback.
 */
export function getEmptyUserInfo(): UserInfo {
  return {
    username: '',
    name: null,
    email: null,
    uid: null,
    gid: null,
    groups: [],
    quota: null,
  };
}

// =============================================================================
// Login Info
// =============================================================================

/**
 * Fetch login information including CSRF token and available scopes.
 *
 * @param baseUrl - Gafaelfawr API base URL
 * @returns Login info with CSRF token
 * @throws GafaelfawrError if request fails
 */
export async function fetchLoginInfo(baseUrl: string): Promise<LoginInfo> {
  const url = `${normalizeUrl(baseUrl)}/login`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new GafaelfawrError(
      `Failed to fetch login info: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return LoginInfoSchema.parse(data);
}

// =============================================================================
// Token List
// =============================================================================

/**
 * Fetch all tokens for a user.
 *
 * @param username - Username to fetch tokens for
 * @param baseUrl - Gafaelfawr API base URL
 * @returns Array of token info
 * @throws GafaelfawrError if request fails
 */
export async function fetchUserTokens(
  username: string,
  baseUrl: string
): Promise<TokenInfo[]> {
  const url = `${normalizeUrl(baseUrl)}/users/${encodeURIComponent(username)}/tokens`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new GafaelfawrError(
      `Failed to fetch tokens: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return z.array(TokenInfoSchema).parse(data);
}

// =============================================================================
// Token Details
// =============================================================================

/**
 * Fetch details for a specific token.
 *
 * @param username - Username who owns the token
 * @param tokenKey - 22-character token key
 * @param baseUrl - Gafaelfawr API base URL
 * @returns Token details
 * @throws GafaelfawrError if request fails or token not found
 */
export async function fetchTokenDetails(
  username: string,
  tokenKey: string,
  baseUrl: string
): Promise<TokenInfo> {
  const url = `${normalizeUrl(baseUrl)}/users/${encodeURIComponent(username)}/tokens/${encodeURIComponent(tokenKey)}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new GafaelfawrError(
      `Failed to fetch token details: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return TokenInfoSchema.parse(data);
}

// =============================================================================
// Token History
// =============================================================================

/**
 * Parse cursor from Link header (RFC 5988).
 *
 * @param linkHeader - Link header value
 * @returns Cursor string or null if not found
 */
function parseCursorFromLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  // Look for rel="next" link and extract cursor parameter
  const nextMatch = linkHeader.match(
    /<[^>]*[?&]cursor=([^>&]+)[^>]*>;\s*rel="next"/
  );
  if (nextMatch) {
    return decodeURIComponent(nextMatch[1]);
  }

  return null;
}

/**
 * Fetch token change history with pagination.
 *
 * @param username - Username to fetch history for
 * @param filters - Filter options
 * @param baseUrl - Gafaelfawr API base URL
 * @returns Page of history entries with pagination info
 * @throws GafaelfawrError if request fails
 */
export async function fetchTokenChangeHistory(
  username: string,
  filters: TokenHistoryFilters,
  baseUrl: string
): Promise<TokenHistoryPage> {
  const params = new URLSearchParams();

  if (filters.tokenType) {
    params.set('token_type', filters.tokenType);
  }
  if (filters.token) {
    params.set('key', filters.token);
  }
  if (filters.since) {
    params.set('since', filters.since.toISOString());
  }
  if (filters.until) {
    params.set('until', filters.until.toISOString());
  }
  if (filters.ipAddress) {
    params.set('ip_address', filters.ipAddress);
  }
  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }
  if (filters.cursor) {
    params.set('cursor', filters.cursor);
  }

  const queryString = params.toString();
  const url = `${normalizeUrl(baseUrl)}/users/${encodeURIComponent(username)}/token-change-history${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new GafaelfawrError(
      `Failed to fetch token history: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  const entries = z.array(TokenChangeHistoryEntrySchema).parse(data);

  // Normalize entries - ensure optional fields that may be omitted are set to null
  const normalizedEntries: TokenChangeHistoryEntry[] = entries.map((entry) => ({
    ...entry,
    token_name: entry.token_name ?? null,
    parent: entry.parent ?? null,
    service: entry.service ?? null,
    expires: entry.expires ?? null,
    old_token_name: entry.old_token_name ?? null,
    old_scopes: entry.old_scopes ?? null,
    old_expires: entry.old_expires ?? null,
    ip_address: entry.ip_address ?? null,
  }));

  // Parse pagination info from headers
  const nextCursor = parseCursorFromLink(response.headers.get('Link'));
  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : null;

  return {
    entries: normalizedEntries,
    nextCursor,
    totalCount,
  };
}

// =============================================================================
// Token Creation
// =============================================================================

/**
 * Create a new user token.
 *
 * @param username - Username to create token for
 * @param request - Token creation parameters
 * @param csrfToken - CSRF token from login info
 * @param baseUrl - Gafaelfawr API base URL
 * @returns Created token response (includes full token string)
 * @throws GafaelfawrError if request fails
 */
export async function createToken(
  username: string,
  request: CreateTokenRequest,
  csrfToken: string,
  baseUrl: string
): Promise<CreateTokenResponse> {
  const url = `${normalizeUrl(baseUrl)}/users/${encodeURIComponent(username)}/tokens`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // Try to parse error response for detailed message
    let errorMessage = `Failed to create token: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      const parsed = ErrorResponseSchema.safeParse(errorData);
      if (parsed.success) {
        errorMessage = formatValidationError(parsed.data.detail);
      }
    } catch {
      // Ignore JSON parse errors, use default message
    }

    throw new GafaelfawrError(errorMessage, response.status);
  }

  const data = await response.json();
  return CreateTokenResponseSchema.parse(data);
}

/**
 * Create a new service token via the admin endpoint.
 *
 * Unlike {@link createToken}, this targets the admin endpoint
 * `POST {base}/tokens` (not the per-user
 * `POST {base}/users/{username}/tokens` route) and carries the target bot
 * username in the request body. It requires the `admin:token` scope on the
 * caller's session.
 *
 * @param request - Admin service-token creation parameters (includes the
 *                   target bot username and `token_type: "service"`)
 * @param csrfToken - CSRF token from login info
 * @param baseUrl - Gafaelfawr API base URL
 * @returns Created token response (includes full token string)
 * @throws GafaelfawrError if request fails
 */
export async function createServiceToken(
  request: AdminTokenRequest,
  csrfToken: string,
  baseUrl: string
): Promise<CreateTokenResponse> {
  const url = `${normalizeUrl(baseUrl)}/tokens`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // Try to parse error response for detailed message
    let errorMessage = `Failed to create service token: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      const parsed = ErrorResponseSchema.safeParse(errorData);
      if (parsed.success) {
        errorMessage = formatValidationError(parsed.data.detail);
      }
    } catch {
      // Ignore JSON parse errors, use default message
    }

    throw new GafaelfawrError(errorMessage, response.status);
  }

  const data = await response.json();
  return CreateTokenResponseSchema.parse(data);
}

// =============================================================================
// Token Deletion
// =============================================================================

/**
 * Delete (revoke) a user token.
 *
 * @param username - Username who owns the token
 * @param tokenKey - 22-character token key to delete
 * @param csrfToken - CSRF token from login info
 * @param baseUrl - Gafaelfawr API base URL
 * @throws GafaelfawrError if request fails
 */
export async function deleteToken(
  username: string,
  tokenKey: string,
  csrfToken: string,
  baseUrl: string
): Promise<void> {
  const url = `${normalizeUrl(baseUrl)}/users/${encodeURIComponent(username)}/tokens/${encodeURIComponent(tokenKey)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete token: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      const parsed = ErrorResponseSchema.safeParse(errorData);
      if (parsed.success) {
        errorMessage = formatValidationError(parsed.data.detail);
      }
    } catch {
      // Ignore JSON parse errors, use default message
    }

    throw new GafaelfawrError(errorMessage, response.status);
  }
}

// =============================================================================
// OpenID Connect Clients
// =============================================================================

/**
 * Read the most specific error message a failed response offers.
 *
 * Gafaelfawr returns an `ErrorModel` (`{ detail: [...] }`) with 403/404/422, so
 * prefer that over the bare status line. Falls back to `fallback` when the body
 * is missing, unparseable, or shaped differently (e.g. an ingress-generated
 * error page).
 */
async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const errorData = await response.json();
    const parsed = ErrorResponseSchema.safeParse(errorData);
    if (parsed.success) {
      return formatValidationError(parsed.data.detail);
    }
  } catch {
    // Ignore JSON parse errors and use the fallback message.
  }
  return fallback;
}

/**
 * Throw the right error for a failed OIDC-client response.
 *
 * `notConfiguredOn404` distinguishes Gafaelfawr's two meanings of 404 on this
 * API: on the collection endpoints it means the environment has no OpenID
 * Connect server, which callers render as a dedicated empty state; on the
 * per-client routes it means no such client, an ordinary 404.
 */
async function throwOidcError(
  response: Response,
  fallback: string,
  { notConfiguredOn404 }: { notConfiguredOn404: boolean }
): Promise<never> {
  const message = await readErrorMessage(
    response,
    `${fallback}: ${response.status} ${response.statusText}`
  );
  if (notConfiguredOn404 && response.status === 404) {
    throw new OidcNotConfiguredError(message);
  }
  throw new GafaelfawrError(message, response.status);
}

/**
 * Fetch every registered OpenID Connect client.
 *
 * @param baseUrl - Gafaelfawr API base URL
 * @returns All OIDC clients (without secrets)
 * @throws OidcNotConfiguredError if this environment has no OIDC server
 * @throws GafaelfawrError for any other failure
 */
export async function fetchOidcClients(baseUrl: string): Promise<OIDCClient[]> {
  const url = `${normalizeUrl(baseUrl)}/oidc-clients`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    await throwOidcError(response, 'Failed to fetch OIDC clients', {
      notConfiguredOn404: true,
    });
  }

  const data = await response.json();
  return z.array(OIDCClientSchema).parse(data);
}

/**
 * Fetch a single OpenID Connect client.
 *
 * @param clientId - Server-assigned client identifier
 * @param baseUrl - Gafaelfawr API base URL
 * @returns The client (without its secret, which is never readable again)
 * @throws GafaelfawrError if the request fails or the client does not exist
 */
export async function fetchOidcClient(
  clientId: string,
  baseUrl: string
): Promise<OIDCClient> {
  const url = `${normalizeUrl(baseUrl)}/oidc-clients/${encodeURIComponent(clientId)}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    await throwOidcError(response, 'Failed to fetch OIDC client', {
      notConfiguredOn404: false,
    });
  }

  const data = await response.json();
  return OIDCClientSchema.parse(data);
}

/**
 * Register a new OpenID Connect client.
 *
 * The returned `client_secret` is the only time Gafaelfawr discloses it — there
 * is no rotate endpoint — so callers must surface it to the operator once and
 * not persist it anywhere else.
 *
 * @param request - The client fields to set
 * @param csrfToken - CSRF token from login info
 * @param baseUrl - Gafaelfawr API base URL
 * @returns The created client, including its one-time secret
 * @throws OidcNotConfiguredError if this environment has no OIDC server
 * @throws GafaelfawrError for any other failure (403, 422, …)
 */
export async function createOidcClient(
  request: OIDCClientUpdate,
  csrfToken: string,
  baseUrl: string
): Promise<OIDCClientWithSecret> {
  const url = `${normalizeUrl(baseUrl)}/oidc-clients`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await throwOidcError(response, 'Failed to create OIDC client', {
      notConfiguredOn404: true,
    });
  }

  const data = await response.json();
  return OIDCClientWithSecretSchema.parse(data);
}

/**
 * Update an existing OpenID Connect client.
 *
 * Gafaelfawr exposes this as PATCH but requires `return_uri` and `description`
 * on every call, so `request` carries the client's complete updatable state
 * rather than only the changed fields.
 *
 * @param clientId - Server-assigned client identifier
 * @param request - The full set of updatable fields
 * @param csrfToken - CSRF token from login info
 * @param baseUrl - Gafaelfawr API base URL
 * @returns The updated client
 * @throws GafaelfawrError if the request fails or the client does not exist
 */
export async function updateOidcClient(
  clientId: string,
  request: OIDCClientUpdate,
  csrfToken: string,
  baseUrl: string
): Promise<OIDCClient> {
  const url = `${normalizeUrl(baseUrl)}/oidc-clients/${encodeURIComponent(clientId)}`;

  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await throwOidcError(response, 'Failed to update OIDC client', {
      notConfiguredOn404: false,
    });
  }

  const data = await response.json();
  return OIDCClientSchema.parse(data);
}

/**
 * Delete an OpenID Connect client.
 *
 * @param clientId - Server-assigned client identifier
 * @param csrfToken - CSRF token from login info
 * @param baseUrl - Gafaelfawr API base URL
 * @throws GafaelfawrError if the request fails or the client does not exist
 */
export async function deleteOidcClient(
  clientId: string,
  csrfToken: string,
  baseUrl: string
): Promise<void> {
  const url = `${normalizeUrl(baseUrl)}/oidc-clients/${encodeURIComponent(clientId)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'x-csrf-token': csrfToken,
    },
  });

  if (!response.ok) {
    await throwOidcError(response, 'Failed to delete OIDC client', {
      notConfiguredOn404: false,
    });
  }
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Normalize URL by removing trailing slashes.
 *
 * @param url - URL to normalize
 * @returns URL without trailing slashes
 */
function normalizeUrl(url: string): string {
  let normalized = url;
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/** Default Gafaelfawr API URL for fallback */
export const DEFAULT_GAFAELFAWR_URL = '/auth/api/v1';
