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
  type AdminTokenRequest,
  // Schemas
  AdminTokenRequestSchema,
  type CreateTokenRequest,
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
  type OIDCClient,
  OIDCClientSchema,
  type OIDCClientUpdate,
  OIDCClientUpdateSchema,
  type OIDCClientWithSecret,
  OIDCClientWithSecretSchema,
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
  CreateOidcClientVariables,
  CreateServiceTokenVariables,
  CreateTokenVariables,
  DeleteOidcClientVariables,
  DeleteTokenVariables,
  TokenHistoryFilters,
  TokenHistoryPage,
  UpdateOidcClientVariables,
} from './types';

// =============================================================================
// Client Functions
// =============================================================================

export {
  createOidcClient,
  createServiceToken,
  createToken,
  DEFAULT_GAFAELFAWR_URL,
  deleteOidcClient,
  deleteToken,
  fetchLoginInfo,
  fetchOidcClient,
  fetchOidcClients,
  fetchTokenChangeHistory,
  fetchTokenDetails,
  fetchUserInfo,
  fetchUserTokens,
  getEmptyUserInfo,
  updateOidcClient,
} from './client';

// =============================================================================
// Error Handling
// =============================================================================

export {
  formatValidationError,
  GafaelfawrError,
  getErrorMessageForStatus,
  isOidcNotConfiguredError,
  type OidcClientMutationError,
  OidcNotConfiguredError,
  type TokenCreationError,
  type TokenDeletionError,
  toGafaelfawrErrorInfo,
} from './errors';

// =============================================================================
// Query Keys
// =============================================================================

export { type GafaelfawrQueryKeys, gafaelfawrKeys } from './query-keys';

// =============================================================================
// Query Options (TanStack Query Integration)
// =============================================================================

export type { AuthQueryConfig, Logger } from './query-options';
export {
  loginInfoQueryOptions,
  oidcClientQueryOptions,
  oidcClientsQueryOptions,
  tokenDetailsQueryOptions,
  tokenHistoryQueryOptions,
  userInfoQueryOptions,
  userTokensQueryOptions,
} from './query-options';

// =============================================================================
// Mutation Options
// =============================================================================

export {
  createOidcClientMutationConfig,
  createServiceTokenMutationConfig,
  createTokenMutationConfig,
  deleteOidcClientMutationConfig,
  deleteTokenMutationConfig,
  updateOidcClientMutationConfig,
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
  mockOidcClients,
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
  type CreateServiceTokenParams,
  type CreateTokenParams,
  extractTokenNames,
  type UseCreateOidcClientReturn,
  type UseCreateServiceTokenReturn,
  type UseCreateTokenReturn,
  type UseDeleteOidcClientReturn,
  type UseDeleteTokenReturn,
  type UseLoginInfoReturn,
  type UseOidcClientReturn,
  type UseOidcClientsReturn,
  type UseTokenChangeHistoryReturn,
  type UseTokenDetailsReturn,
  type UseUpdateOidcClientReturn,
  type UseUserInfoReturn,
  type UseUserTokensReturn,
  useCreateOidcClient,
  useCreateServiceToken,
  useCreateToken,
  useDeleteOidcClient,
  useDeleteToken,
  useGafaelfawrUrl,
  useLoginInfo,
  useOidcClient,
  useOidcClients,
  useTokenChangeHistory,
  useTokenDetails,
  useUpdateOidcClient,
  useUserInfo,
  useUserTokens,
} from './hooks';
