/**
 * Mock data for Gafaelfawr API responses.
 *
 * Hand-written, realistic mock data for development and testing.
 */
import type {
  LoginInfo,
  TokenChangeHistoryEntry,
  TokenInfo,
  UserInfo,
} from './schemas';

/**
 * Mock user info for an authenticated user.
 */
export const mockUserInfo: UserInfo = {
  username: 'testuser',
  name: 'Test User',
  email: 'testuser@example.com',
  uid: 1000,
  gid: 1000,
  groups: [
    { name: 'science', id: 100 },
    { name: 'developers', id: 101 },
  ],
  quota: {
    api: {
      tap: 100,
    },
    notebook: {
      cpu: 4,
      memory: 16,
      spawn: true,
    },
    tap: {},
  },
};

/**
 * Mock user info for an unauthenticated user.
 */
export const mockUnauthenticatedUserInfo: UserInfo = {
  username: '',
  name: null,
  email: null,
  uid: null,
  gid: null,
  groups: [],
  quota: null,
};

/**
 * Mock login info with CSRF token and available scopes.
 */
export const mockLoginInfo: LoginInfo = {
  csrf: 'mock-csrf-token-abc123def456',
  username: 'testuser',
  scopes: ['read:tap', 'exec:notebook', 'read:image'],
  config: {
    scopes: [
      { name: 'read:tap', description: 'Query TAP services' },
      { name: 'exec:notebook', description: 'Run notebooks in Nublado' },
      { name: 'read:image', description: 'Read images from the archive' },
      { name: 'admin:token', description: 'Administer user tokens' },
      { name: 'exec:portal', description: 'Use the Firefly portal' },
    ],
  },
};

/**
 * Mock user tokens list.
 */
export const mockTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'session',
    service: null,
    scopes: ['read:tap', 'exec:notebook'],
    created: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    expires: Math.floor(Date.now() / 1000) + 86400 * 6, // 6 days from now
    token: 'gt-abc123def456ghij789', // 22 chars
    token_name: null,
    last_used: null,
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:tap'],
    created: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
    expires: Math.floor(Date.now() / 1000) + 86400 * 335, // ~11 months from now
    token: 'gt-user1234567890ab1cd', // 22 chars
    token_name: 'TAP access token',
    last_used: null,
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:tap', 'read:image'],
    created: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
    expires: null, // Never expires
    token: 'gt-mytoken12345678abcd', // 22 chars
    token_name: 'CI Pipeline Token',
    last_used: null,
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'notebook',
    service: null,
    scopes: ['read:tap', 'exec:notebook'],
    created: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    expires: Math.floor(Date.now() / 1000) + 3600 * 23, // 23 hours from now
    token: 'gt-notebook123456789ab', // 22 chars
    token_name: null,
    last_used: null,
    parent: 'gt-abc123def456ghij789', // 22 chars
  },
];

/**
 * Mock token for a specific token detail request.
 */
export const mockTokenDetail: TokenInfo = mockTokens[1];

/**
 * Mock token change history entries.
 */
export const mockTokenHistory: TokenChangeHistoryEntry[] = [
  {
    token: 'gt-mytoken12345678abcd', // 22 chars
    username: 'testuser',
    token_type: 'user',
    token_name: 'CI Pipeline Token',
    parent: null,
    scopes: ['read:tap', 'read:image'],
    service: null,
    expires: null,
    actor: 'testuser',
    action: 'create',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '192.168.1.100',
    event_time: Math.floor(Date.now() / 1000) - 86400 * 7,
  },
  {
    token: 'gt-user1234567890ab1cd', // 22 chars
    username: 'testuser',
    token_type: 'user',
    token_name: 'TAP access token',
    parent: null,
    scopes: ['read:tap'],
    service: null,
    expires: Math.floor(Date.now() / 1000) + 86400 * 335,
    actor: 'testuser',
    action: 'create',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '192.168.1.100',
    event_time: Math.floor(Date.now() / 1000) - 86400 * 30,
  },
  {
    token: 'gt-oldtoken12345678901', // 22 chars
    username: 'testuser',
    token_type: 'user',
    token_name: 'Old API Token',
    parent: null,
    scopes: ['read:tap'],
    service: null,
    expires: Math.floor(Date.now() / 1000) - 86400 * 10,
    actor: 'testuser',
    action: 'revoke',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '192.168.1.100',
    event_time: Math.floor(Date.now() / 1000) - 86400 * 15,
  },
  {
    token: 'gt-editedtoken12345678', // 22 chars
    username: 'testuser',
    token_type: 'user',
    token_name: 'Renamed Token',
    parent: null,
    scopes: ['read:tap', 'exec:notebook'],
    service: null,
    expires: Math.floor(Date.now() / 1000) + 86400 * 100,
    actor: 'testuser',
    action: 'edit',
    old_token_name: 'Original Token Name',
    old_scopes: ['read:tap'],
    old_expires: null,
    ip_address: '192.168.1.100',
    event_time: Math.floor(Date.now() / 1000) - 86400 * 45,
  },
];

/**
 * Generate a random 22-character token key.
 */
export function generateMockTokenKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'gt-';
  for (let i = 0; i < 19; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a mock token with custom properties.
 */
export function generateMockToken(
  overrides: Partial<TokenInfo> = {}
): TokenInfo {
  return {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:tap'],
    created: Math.floor(Date.now() / 1000),
    expires: Math.floor(Date.now() / 1000) + 86400 * 365,
    token: generateMockTokenKey(),
    token_name: 'Generated Token',
    last_used: null,
    parent: null,
    ...overrides,
  };
}
