import React from 'react';
import TokenDetailsView from './TokenDetailsView';
import type { TokenInfo } from '../../hooks/useUserTokens';

// Mock the hooks
const mockUseTokenDetails = (
  token: TokenInfo | undefined,
  isLoading = false,
  error: any = null
) => ({
  token,
  error,
  isLoading,
  mutate: () => Promise.resolve(),
});

const mockUseDeleteToken = () => ({
  deleteToken: async () => {},
  isDeleting: false,
  error: null,
});

// Mock modules
vi.mock('../../hooks/useTokenDetails', () => ({
  default: () => mockUseTokenDetails(mockToken),
}));

vi.mock('../../hooks/useDeleteToken', () => ({
  default: () => mockUseDeleteToken(),
}));

vi.mock('../TokenHistory/TokenHistoryView', () => ({
  default: ({ username, token }: { username: string; token: string }) => (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <p>Token History for: {token}</p>
      <p>Username: {username}</p>
      <p>(TokenHistoryView component mocked for stories)</p>
    </div>
  ),
}));

export default {
  title: 'Components/TokenDetails/TokenDetailsView',
  component: TokenDetailsView,
  parameters: {
    layout: 'padded',
  },
};

const now = Math.floor(Date.now() / 1000);

const mockToken: TokenInfo = {
  username: 'testuser',
  token_type: 'user',
  service: null,
  scopes: ['read:tap', 'exec:notebook', 'write:tap'],
  created: now - 86400 * 30,
  expires: now + 86400 * 30,
  token: 'abc123xyz456789012345',
  token_name: 'My Laptop Token',
  last_used: now - 3600,
  parent: null,
};

const mockTokenWithParent: TokenInfo = {
  ...mockToken,
  token: 'def456abc789012345678',
  token_name: 'Child Token',
  parent: 'abc123xyz456789012345',
  scopes: ['read:tap'],
};

const mockSessionToken: TokenInfo = {
  ...mockToken,
  token: 'session123456789012345',
  token_type: 'session',
  token_name: undefined,
  scopes: ['read:all', 'exec:notebook'],
};

const mockExpiredToken: TokenInfo = {
  ...mockToken,
  token: 'expired12345678901234',
  token_name: 'Expired Token',
  expires: now - 86400,
  last_used: now - 86400 * 2,
};

const mockNeverUsedToken: TokenInfo = {
  ...mockToken,
  token: 'neverused1234567890123',
  token_name: 'Never Used Token',
  last_used: undefined,
};

export const Default = {
  args: {
    username: 'testuser',
    tokenKey: 'abc123xyz456789012345',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/abc123xyz456789012345',
        method: 'GET',
        status: 200,
        response: mockToken,
      },
    ],
  },
};

export const WithParent = {
  args: {
    username: 'testuser',
    tokenKey: 'def456abc789012345678',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/def456abc789012345678',
        method: 'GET',
        status: 200,
        response: mockTokenWithParent,
      },
    ],
  },
};

export const SessionToken = {
  args: {
    username: 'testuser',
    tokenKey: 'session123456789012345',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/session123456789012345',
        method: 'GET',
        status: 200,
        response: mockSessionToken,
      },
    ],
  },
};

export const ExpiredToken = {
  args: {
    username: 'testuser',
    tokenKey: 'expired12345678901234',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/expired12345678901234',
        method: 'GET',
        status: 200,
        response: mockExpiredToken,
      },
    ],
  },
};

export const NeverUsedToken = {
  args: {
    username: 'testuser',
    tokenKey: 'neverused1234567890123',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/neverused1234567890123',
        method: 'GET',
        status: 200,
        response: mockNeverUsedToken,
      },
    ],
  },
};

export const Loading = {
  args: {
    username: 'testuser',
    tokenKey: 'abc123xyz456789012345',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/abc123xyz456789012345',
        method: 'GET',
        delay: 9999999, // Infinite delay to simulate loading
      },
    ],
  },
};

export const NotFound = {
  args: {
    username: 'testuser',
    tokenKey: 'notfound12345678901234',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/notfound12345678901234',
        method: 'GET',
        status: 404,
        response: { detail: 'Token not found' },
      },
    ],
  },
};

export const NetworkError = {
  args: {
    username: 'testuser',
    tokenKey: 'error123456789012345',
  },
  parameters: {
    mockData: [
      {
        url: '/auth/api/v1/users/testuser/tokens/error123456789012345',
        method: 'GET',
        status: 500,
        response: { detail: 'Internal server error' },
      },
    ],
  },
};
