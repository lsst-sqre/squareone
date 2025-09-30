import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AccessTokenItem from './AccessTokenItem';
import type { TokenInfo } from '../../hooks/useUserTokens';
import styles from './AccessTokensView.module.css';

// Mock token data
const now = Math.floor(Date.now() / 1000);

const mockUserTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:user', 'write:user', 'admin:token'],
    token: 'gt-abc123def456',
    token_name: 'my-recent-token',
    created: now - 86400, // 1 day ago
    expires: now + 86400 * 30, // 30 days from now
    last_used: now - 3600 * 2, // 2 hours ago
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:user'],
    token: 'gt-xyz789ghi012',
    token_name: 'my-old-token',
    created: now - 86400 * 90, // 90 days ago
    expires: null, // Never expires
    last_used: now - 86400 * 5, // 5 days ago
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['exec:notebook', 'exec:portal', 'read:tap'],
    token: 'gt-mno345pqr678',
    token_name: 'notebook-token',
    created: now - 86400 * 7, // 7 days ago
    expires: now + 86400 * 7, // 7 days from now
    last_used: null, // Never used
    parent: null,
  },
];

// Session tokens (should be filtered out)
const mockSessionTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'session',
    service: null,
    scopes: ['read:user'],
    token: 'gt-session123',
    token_name: 'session-token',
    created: now - 3600,
    expires: now + 3600 * 24,
    last_used: now - 60,
    parent: null,
  },
];

// Wrapper component for Storybook that doesn't use the SWR hook
type AccessTokensViewWrapperProps = {
  tokens: TokenInfo[];
  isLoading?: boolean;
  error?: string;
  username: string;
};

function AccessTokensViewWrapper({
  tokens,
  isLoading = false,
  error,
  username,
}: AccessTokensViewWrapperProps) {
  // Filter to user tokens only and sort by created (most recent first)
  const userTokens = tokens
    .filter((token) => token.token_type === 'user')
    .sort((a, b) => {
      const aCreated = a.created ?? 0;
      const bCreated = b.created ?? 0;
      return bCreated - aCreated;
    });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tokens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load tokens: {error}</div>
      </div>
    );
  }

  // Don't render if there are no user tokens
  if (userTokens.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {userTokens.map((token) => (
        <AccessTokenItem key={token.token} token={token} username={username} />
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/AccessTokensView/AccessTokensView',
  component: AccessTokensViewWrapper,
  parameters: {
    layout: 'padded',
  },
  args: {
    username: 'testuser',
  },
} satisfies Meta<typeof AccessTokensViewWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTokens: Story = {
  args: {
    tokens: mockUserTokens,
  },
};

export const WithMixedTokenTypes: Story = {
  args: {
    tokens: [...mockUserTokens, ...mockSessionTokens],
  },
};

export const Loading: Story = {
  args: {
    tokens: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    tokens: [],
    error: 'HTTP 404: Not Found',
  },
};

export const EmptyTokenList: Story = {
  args: {
    tokens: [],
  },
};

export const OnlySessionTokens: Story = {
  args: {
    tokens: mockSessionTokens,
  },
};

export const SingleToken: Story = {
  args: {
    tokens: [mockUserTokens[0]],
  },
};

export const ManyTokens: Story = {
  args: {
    tokens: Array.from({ length: 10 }, (_, i) => ({
      username: 'testuser',
      token_type: 'user' as const,
      service: null,
      scopes: ['read:user', 'write:user'],
      token: `gt-token${i}`,
      token_name: `token-${i}`,
      created: now - 86400 * (i + 1),
      expires: now + 86400 * 30,
      last_used: now - 3600 * (i + 1),
      parent: null,
    })),
  },
};
