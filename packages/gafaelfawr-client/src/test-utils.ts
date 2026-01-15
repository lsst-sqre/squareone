/**
 * Test utilities for Gafaelfawr client testing.
 *
 * Provides random data generators using @anatine/zod-mock.
 */
import { generateMock } from '@anatine/zod-mock';

import {
  type LoginInfo,
  LoginInfoSchema,
  type TokenChangeHistoryEntry,
  TokenChangeHistoryEntrySchema,
  type TokenInfo,
  TokenInfoSchema,
  type UserInfo,
  UserInfoSchema,
} from './schemas';

/**
 * Generate random user info.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomUserInfo(seed?: number): UserInfo {
  return generateMock(UserInfoSchema, { seed });
}

/**
 * Generate random login info.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomLoginInfo(seed?: number): LoginInfo {
  return generateMock(LoginInfoSchema, { seed });
}

/**
 * Generate random token info.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomTokenInfo(seed?: number): TokenInfo {
  return generateMock(TokenInfoSchema, { seed });
}

/**
 * Generate random token change history entry.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomHistoryEntry(
  seed?: number
): TokenChangeHistoryEntry {
  return generateMock(TokenChangeHistoryEntrySchema, { seed });
}

/**
 * Collection of generator functions for all Gafaelfawr types.
 */
export const generators = {
  userInfo: generateRandomUserInfo,
  loginInfo: generateRandomLoginInfo,
  tokenInfo: generateRandomTokenInfo,
  historyEntry: generateRandomHistoryEntry,
};
