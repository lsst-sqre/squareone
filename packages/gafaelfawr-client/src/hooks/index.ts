/**
 * React hooks for Gafaelfawr API interactions.
 *
 * All hooks support repertoire service discovery for dynamic URL resolution.
 */

export {
  type UseCreateOidcClientReturn,
  useCreateOidcClient,
} from './useCreateOidcClient';
export {
  type CreateServiceTokenParams,
  type UseCreateServiceTokenReturn,
  useCreateServiceToken,
} from './useCreateServiceToken';
export {
  type CreateTokenParams,
  type UseCreateTokenReturn,
  useCreateToken,
} from './useCreateToken';
export {
  type UseDeleteOidcClientReturn,
  useDeleteOidcClient,
} from './useDeleteOidcClient';
export { type UseDeleteTokenReturn, useDeleteToken } from './useDeleteToken';
export { useGafaelfawrUrl } from './useGafaelfawrUrl';
export { type UseLoginInfoReturn, useLoginInfo } from './useLoginInfo';
export { type UseOidcClientReturn, useOidcClient } from './useOidcClient';
export { type UseOidcClientsReturn, useOidcClients } from './useOidcClients';
export {
  type UseTokenChangeHistoryReturn,
  useTokenChangeHistory,
} from './useTokenChangeHistory';
export { type UseTokenDetailsReturn, useTokenDetails } from './useTokenDetails';
export {
  type UseUpdateOidcClientReturn,
  useUpdateOidcClient,
} from './useUpdateOidcClient';
export { type UseUserInfoReturn, useUserInfo } from './useUserInfo';
export {
  extractTokenNames,
  type UseUserTokensReturn,
  useUserTokens,
} from './useUserTokens';
