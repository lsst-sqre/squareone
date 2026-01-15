/**
 * React hooks for Gafaelfawr API interactions.
 *
 * All hooks support repertoire service discovery for dynamic URL resolution.
 */

export {
  type CreateTokenParams,
  type UseCreateTokenReturn,
  useCreateToken,
} from './useCreateToken';
export { type UseDeleteTokenReturn, useDeleteToken } from './useDeleteToken';
export { useGafaelfawrUrl } from './useGafaelfawrUrl';
export { type UseLoginInfoReturn, useLoginInfo } from './useLoginInfo';
export {
  type UseTokenChangeHistoryReturn,
  useTokenChangeHistory,
} from './useTokenChangeHistory';
export { type UseTokenDetailsReturn, useTokenDetails } from './useTokenDetails';
export { type UseUserInfoReturn, useUserInfo } from './useUserInfo';
export {
  extractTokenNames,
  type UseUserTokensReturn,
  useUserTokens,
} from './useUserTokens';
