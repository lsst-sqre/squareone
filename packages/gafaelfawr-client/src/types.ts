/**
 * Type re-exports from schemas.
 *
 * This file provides a convenient way to import just types without
 * pulling in Zod schemas.
 */
export type {
  CreateTokenRequest,
  CreateTokenResponse,
  ErrorResponse,
  Group,
  LoginInfo,
  NotebookQuota,
  OIDCClient,
  OIDCClientUpdate,
  OIDCClientWithSecret,
  Quota,
  Scope,
  TokenChangeAction,
  TokenChangeHistoryEntry,
  TokenInfo,
  TokenType,
  UserInfo,
  ValidationError,
} from './schemas';

/**
 * Token history filter options for queries
 */
export type TokenHistoryFilters = {
  /** Filter by token type */
  tokenType?: string;
  /** Filter by specific token key */
  token?: string;
  /** Filter events since this date */
  since?: Date;
  /** Filter events until this date */
  until?: Date;
  /** Filter by IP address */
  ipAddress?: string;
  /** Limit number of results per page */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string | null;
};

/**
 * Paginated response from token history endpoint
 */
export type TokenHistoryPage = {
  entries: import('./schemas').TokenChangeHistoryEntry[];
  nextCursor: string | null;
  totalCount: number | null;
};

/**
 * Variables for delete token mutation
 */
export type DeleteTokenVariables = {
  username: string;
  tokenKey: string;
  csrfToken: string;
  baseUrl: string;
};

/**
 * Variables for create token mutation
 */
export type CreateTokenVariables = {
  username: string;
  tokenName: string;
  scopes: string[];
  expires: Date | null;
  csrfToken: string;
  baseUrl: string;
};

/**
 * Variables for create service token mutation (admin endpoint).
 *
 * `username` is the target bot user; the optional metadata fields
 * (name/email/uid/gid/groups) are sent only when supplied. There is no
 * `tokenName` — Gafaelfawr's service path rejects a `token_name`.
 */
export type CreateServiceTokenVariables = {
  username: string;
  scopes: string[];
  expires: Date | null;
  name?: string | null;
  email?: string | null;
  uid?: number | null;
  gid?: number | null;
  groups?: import('./schemas').Group[];
  csrfToken: string;
  baseUrl: string;
};

/**
 * Variables for the create-OIDC-client mutation.
 *
 * `baseUrl` travels with the variables (rather than being closed over) so the
 * mutation config stays a plain object the hooks can share, matching the
 * token mutations.
 */
export type CreateOidcClientVariables = {
  request: import('./schemas').OIDCClientUpdate;
  csrfToken: string;
  baseUrl: string;
};

/**
 * Variables for the update-OIDC-client mutation.
 *
 * `request` is the client's complete updatable state, not a sparse diff:
 * Gafaelfawr's PATCH requires `return_uri` and `description` on every call.
 */
export type UpdateOidcClientVariables = {
  clientId: string;
  request: import('./schemas').OIDCClientUpdate;
  csrfToken: string;
  baseUrl: string;
};

/** Variables for the delete-OIDC-client mutation. */
export type DeleteOidcClientVariables = {
  clientId: string;
  csrfToken: string;
  baseUrl: string;
};
