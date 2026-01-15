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
