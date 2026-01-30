/**
 * @lsst-sqre/gafaelfawr-client
 *
 * Gafaelfawr authentication API client with TanStack Query integration.
 *
 * This package provides:
 * - Zod schemas for Gafaelfawr API responses
 * - Fetch functions with validation
 * - TanStack Query integration (query options, mutations)
 * - React hooks for convenient data access
 * - Mock data for development and testing
 *
 * @example
 * ```tsx
 * // In a React component
 * import { useUserInfo, useUserTokens } from '@lsst-sqre/gafaelfawr-client/hooks';
 *
 * function MyComponent() {
 *   const { userInfo, isLoggedIn, isLoading } = useUserInfo();
 *   const { tokens } = useUserTokens(userInfo?.username);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isLoggedIn) return <div>Please log in</div>;
 *
 *   return <div>You have {tokens?.length ?? 0} tokens</div>;
 * }
 * ```
 */

// =============================================================================
// Schemas and Types
// =============================================================================

export {
  // Types
  type CreateTokenRequest,
  // Schemas
  CreateTokenRequestSchema,
  type CreateTokenResponse,
  CreateTokenResponseSchema,
  type ErrorResponse,
  ErrorResponseSchema,
  type Group,
  GroupSchema,
  type LoginInfo,
  LoginInfoSchema,
  type NotebookQuota,
  NotebookQuotaSchema,
  type Quota,
  QuotaSchema,
  type Scope,
  ScopeSchema,
  type TokenChangeAction,
  TokenChangeActionSchema,
  type TokenChangeHistoryEntry,
  TokenChangeHistoryEntrySchema,
  type TokenInfo,
  TokenInfoSchema,
  type TokenType,
  TokenTypeSchema,
  type UserInfo,
  UserInfoSchema,
  type ValidationError,
  ValidationErrorSchema,
} from './schemas';

export type {
  CreateTokenVariables,
  DeleteTokenVariables,
  TokenHistoryFilters,
  TokenHistoryPage,
} from './types';

// =============================================================================
// Client Functions
// =============================================================================

export {
  createToken,
  DEFAULT_GAFAELFAWR_URL,
  deleteToken,
  fetchLoginInfo,
  fetchTokenChangeHistory,
  fetchTokenDetails,
  fetchUserInfo,
  fetchUserTokens,
  getEmptyUserInfo,
} from './client';

// =============================================================================
// Error Handling
// =============================================================================

export {
  formatValidationError,
  GafaelfawrError,
  getErrorMessageForStatus,
  type TokenCreationError,
  type TokenDeletionError,
} from './errors';

// =============================================================================
// Query Keys
// =============================================================================

export { type GafaelfawrQueryKeys, gafaelfawrKeys } from './query-keys';

// =============================================================================
// Query Options (TanStack Query Integration)
// =============================================================================

export type { Logger } from './query-options';
export {
  loginInfoQueryOptions,
  tokenDetailsQueryOptions,
  tokenHistoryQueryOptions,
  userInfoQueryOptions,
  userTokensQueryOptions,
} from './query-options';

// =============================================================================
// Mutation Options
// =============================================================================

export {
  createTokenMutationConfig,
  deleteTokenMutationConfig,
} from './mutation-options';

// =============================================================================
// Query Helper Classes
// =============================================================================

export {
  createLoginInfoQuery,
  createTokenListQuery,
  createUserInfoQuery,
  LoginInfoQuery,
  TokenListQuery,
  UserInfoQuery,
} from './query';

// =============================================================================
// Mock Data
// =============================================================================

export {
  generateMockToken,
  generateMockTokenKey,
  mockLoginInfo,
  mockTokenDetail,
  mockTokenHistory,
  mockTokens,
  mockUnauthenticatedUserInfo,
  mockUserInfo,
} from './mock-data';

// =============================================================================
// Hooks (re-exported from ./hooks for convenience)
// =============================================================================

export {
  type CreateTokenParams,
  extractTokenNames,
  type UseCreateTokenReturn,
  type UseDeleteTokenReturn,
  type UseLoginInfoReturn,
  type UseTokenChangeHistoryReturn,
  type UseTokenDetailsReturn,
  type UseUserInfoReturn,
  type UseUserTokensReturn,
  useCreateToken,
  useDeleteToken,
  useGafaelfawrUrl,
  useLoginInfo,
  useTokenChangeHistory,
  useTokenDetails,
  useUserInfo,
  useUserTokens,
} from './hooks';
