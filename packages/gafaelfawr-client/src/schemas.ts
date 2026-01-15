/**
 * Zod schemas for Gafaelfawr API responses.
 *
 * These schemas are the source of truth for types - all TypeScript types
 * are inferred from these schemas using z.infer<>.
 */
import { z } from 'zod';

// =============================================================================
// Enums
// =============================================================================

/** Token type enum matching Gafaelfawr's token types */
export const TokenTypeSchema = z.enum([
  'session',
  'user',
  'notebook',
  'internal',
  'service',
  'oidc',
]);

/** Token change action enum for history entries */
export const TokenChangeActionSchema = z.enum([
  'create',
  'revoke',
  'expire',
  'edit',
]);

// =============================================================================
// Component Schemas
// =============================================================================

/** Group membership schema */
export const GroupSchema = z.object({
  name: z.string().min(1),
  id: z.number().int().min(1),
});

/** Notebook quota schema */
export const NotebookQuotaSchema = z.object({
  cpu: z.number(),
  memory: z.number(),
  spawn: z.boolean().default(true),
});

/** User quota schema */
export const QuotaSchema = z.object({
  api: z.record(z.number()).default({}),
  notebook: NotebookQuotaSchema.nullable().optional(),
  tap: z.record(z.object({ concurrent: z.number() })).default({}),
});

/** Scope description schema (from login config) */
export const ScopeSchema = z.object({
  name: z.string(),
  description: z.string(),
});

// =============================================================================
// API Response Schemas
// =============================================================================

/**
 * User info schema from GET /auth/api/v1/user-info
 */
export const UserInfoSchema = z.object({
  username: z.string().min(1).max(64),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  uid: z.number().int().min(1).nullable().optional(),
  gid: z.number().int().min(1).nullable().optional(),
  groups: z.array(GroupSchema).default([]),
  quota: QuotaSchema.nullable().optional(),
});

/**
 * Login info schema from GET /auth/api/v1/login
 * Contains CSRF token and available scopes
 */
export const LoginInfoSchema = z.object({
  csrf: z.string(),
  username: z.string(),
  scopes: z.array(z.string()),
  config: z.object({
    scopes: z.array(ScopeSchema),
  }),
});

/**
 * Token info schema from token endpoints
 *
 * Used for:
 * - GET /auth/api/v1/users/{username}/tokens (list)
 * - GET /auth/api/v1/users/{username}/tokens/{key} (detail)
 * - POST /auth/api/v1/users/{username}/tokens (create response)
 */
export const TokenInfoSchema = z.object({
  username: z.string().min(1).max(64),
  token_type: TokenTypeSchema,
  service: z.string().max(64).nullable().optional(),
  scopes: z.array(z.string()),
  created: z.number().int().optional(),
  expires: z.number().int().nullable().optional(),
  token: z.string().length(22),
  token_name: z.string().max(64).nullable().optional(),
  last_used: z.number().int().nullable().optional(),
  parent: z.string().length(22).nullable().optional(),
});

/**
 * Token change history entry schema
 * From GET /auth/api/v1/users/{username}/token-change-history
 */
export const TokenChangeHistoryEntrySchema = z.object({
  token: z.string().length(22),
  username: z.string().min(1).max(64),
  token_type: TokenTypeSchema,
  token_name: z.string().nullable().optional(),
  parent: z.string().length(22).nullable().optional(),
  scopes: z.array(z.string()),
  service: z.string().nullable().optional(),
  expires: z.number().int().nullable().optional(),
  actor: z.string().min(1).max(64),
  action: TokenChangeActionSchema,
  old_token_name: z.string().nullable().optional(),
  old_scopes: z.array(z.string()).nullable().optional(),
  old_expires: z.number().int().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  event_time: z.number().int(),
});

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Token creation request schema
 * For POST /auth/api/v1/users/{username}/tokens
 */
export const CreateTokenRequestSchema = z.object({
  token_name: z.string().min(1).max(64),
  scopes: z.array(z.string()),
  expires: z.number().int().nullable().optional(),
});

/**
 * Token creation response schema
 * Returns the full token string (only shown once)
 */
export const CreateTokenResponseSchema = z.object({
  token: z.string(),
});

// =============================================================================
// Error Schemas
// =============================================================================

/**
 * Pydantic validation error schema
 * Returned in 422 responses
 */
export const ValidationErrorSchema = z.object({
  loc: z
    .array(z.union([z.string(), z.number()]))
    .nullable()
    .optional(),
  msg: z.string(),
  type: z.string(),
});

/**
 * Error response schema from Gafaelfawr
 * The detail field can be a string, single error, or array of errors
 */
export const ErrorResponseSchema = z.object({
  detail: z.union([
    z.string(),
    ValidationErrorSchema,
    z.array(ValidationErrorSchema),
  ]),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type TokenType = z.infer<typeof TokenTypeSchema>;
export type TokenChangeAction = z.infer<typeof TokenChangeActionSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type NotebookQuota = z.infer<typeof NotebookQuotaSchema>;
export type Quota = z.infer<typeof QuotaSchema>;
export type Scope = z.infer<typeof ScopeSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type LoginInfo = z.infer<typeof LoginInfoSchema>;
export type TokenInfo = z.infer<typeof TokenInfoSchema>;
export type TokenChangeHistoryEntry = z.infer<
  typeof TokenChangeHistoryEntrySchema
>;
export type CreateTokenRequest = z.infer<typeof CreateTokenRequestSchema>;
export type CreateTokenResponse = z.infer<typeof CreateTokenResponseSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
