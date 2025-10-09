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
    scopes: ['read:image', 'read:tap', 'write:files'],
    token: '4dE8wPjqh1MY0zsD8svAHQ',
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
    scopes: ['read:image', 'user:token'],
    token: 'xK9mNpLq2RsT3uVwXyZaBc',
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
    token: '7hF5gJ8kL1mN4pQ6rS9tUv',
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
    scopes: ['read:image'],
    token: 'wB3cD5eF7gH9iJ1kL2mN4o',
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
    tokens: Array.from({ length: 10 }, (_, i) => {
      // Generate realistic 22-character token IDs
      const tokenIds = [
        '4dE8wPjqh1MY0zsD8svAHQ',
        'xK9mNpLq2RsT3uVwXyZaBc',
        '7hF5gJ8kL1mN4pQ6rS9tUv',
        'wB3cD5eF7gH9iJ1kL2mN4o',
        'pQ6rS9tUvWxY1zA2bC3dE4',
        'fG5hJ7kL9mN1pQ3rS5tU7v',
        'wX8yZ1aB3cD5eF7gH9iJ1k',
        'L2mN4oP6qR8sT0uV2wX4yZ',
        '6aB8cD0eF2gH4iJ6kL8mN0',
        'oP1qR3sT5uV7wX9yZ1aB3c',
      ];
      // Rotate through different scope combinations
      const scopeSets = [
        ['read:image', 'user:token'],
        ['read:tap', 'write:files'],
        ['exec:notebook', 'read:image'],
        ['write:sasquatch', 'read:tap'],
        ['exec:portal', 'user:token'],
        ['exec:admin', 'read:image'],
        ['exec:internal-tools', 'write:files'],
        ['read:image', 'read:tap', 'user:token'],
        ['exec:notebook', 'exec:portal'],
        ['write:files', 'write:sasquatch'],
      ];
      return {
        username: 'testuser',
        token_type: 'user' as const,
        service: null,
        scopes: scopeSets[i],
        token: tokenIds[i],
        token_name: `token-${i}`,
        created: now - 86400 * (i + 1),
        expires: now + 86400 * 30,
        last_used: now - 3600 * (i + 1),
        parent: null,
      };
    }),
  },
};
