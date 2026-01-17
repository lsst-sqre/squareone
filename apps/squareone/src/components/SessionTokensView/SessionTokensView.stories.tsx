import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SessionTokenItem from './SessionTokenItem';
import styles from './SessionTokensView.module.css';

// Mock token data
const now = Math.floor(Date.now() / 1000);

const mockSessionTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'session',
    service: null,
    scopes: ['read:image', 'read:tap'],
    token: 'wB3cD5eF7gH9iJ1kL2mN4o',
    token_name: 'web-session-1',
    created: now - 3600, // 1 hour ago
    expires: now + 3600 * 24, // 24 hours from now
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'session',
    service: null,
    scopes: ['read:image', 'user:token'],
    token: 'pQ6rS9tUvWxY1zA2bC3dE4',
    token_name: 'web-session-2',
    created: now - 7200, // 2 hours ago
    expires: now + 3600 * 20,
    parent: null,
  },
];

const mockNotebookTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'notebook',
    service: null,
    scopes: ['exec:notebook', 'read:image', 'read:tap'],
    token: 'fG5hJ7kL9mN1pQ3rS5tU7v',
    token_name: 'notebook-session-1',
    created: now - 86400, // 1 day ago
    expires: now + 86400 * 7, // 7 days from now
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'notebook',
    service: null,
    scopes: ['exec:notebook', 'write:files'],
    token: 'wX8yZ1aB3cD5eF7gH9iJ1k',
    created: now - 86400 * 2, // 2 days ago
    expires: now + 86400 * 5,
    parent: null,
  },
];

const mockInternalTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'internal',
    service: null,
    scopes: ['read:all', 'write:all'],
    token: 'L2mN4oP6qR8sT0uV2wX4yZ',
    token_name: 'internal-token-1',
    created: now - 86400 * 30, // 30 days ago
    expires: now + 86400 * 90, // 90 days from now
    parent: null,
  },
];

// Wrapper component for Storybook that doesn't use the SWR hook
type SessionTokensViewWrapperProps = {
  tokens: TokenInfo[];
  isLoading?: boolean;
  error?: string;
  username: string;
  tokenType: 'session' | 'notebook' | 'internal';
};

function SessionTokensViewWrapper({
  tokens,
  isLoading = false,
  error,
  username,
  tokenType,
}: SessionTokensViewWrapperProps) {
  // Filter to specified token type and sort by created (most recent first)
  const sessionTokens = tokens
    .filter((token) => token.token_type === tokenType)
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

  // Don't render if there are no session tokens of this type
  if (sessionTokens.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {sessionTokens.map((token) => (
        <SessionTokenItem key={token.token} token={token} username={username} />
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/SessionTokensView/SessionTokensView',
  component: SessionTokensViewWrapper,
  parameters: {
    layout: 'padded',
  },
  args: {
    username: 'testuser',
    tokenType: 'session',
  },
} satisfies Meta<typeof SessionTokensViewWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WebSessions: Story = {
  args: {
    tokens: mockSessionTokens,
    tokenType: 'session',
  },
};

export const NotebookSessions: Story = {
  args: {
    tokens: mockNotebookTokens,
    tokenType: 'notebook',
  },
};

export const InternalTokens: Story = {
  args: {
    tokens: mockInternalTokens,
    tokenType: 'internal',
  },
};

export const MixedTokenTypes: Story = {
  args: {
    tokens: [
      ...mockSessionTokens,
      ...mockNotebookTokens,
      ...mockInternalTokens,
    ],
    tokenType: 'session',
  },
};

export const Loading: Story = {
  args: {
    tokens: [],
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    tokens: [],
    error: 'HTTP 404: Not Found',
  },
};

export const EmptySessionTokens: Story = {
  args: {
    tokens: [],
    tokenType: 'session',
  },
};

export const SingleWebSession: Story = {
  args: {
    tokens: [mockSessionTokens[0]],
    tokenType: 'session',
  },
};

export const ManyWebSessions: Story = {
  args: {
    tokens: Array.from({ length: 10 }, (_, i) => ({
      username: 'testuser',
      token_type: 'session' as const,
      service: null,
      scopes: ['read:image', 'read:tap'],
      token: `session${i}${Math.random().toString(36).substring(2, 15)}`,
      token_name: `web-session-${i}`,
      created: now - 3600 * (i + 1),
      expires: now + 3600 * 24,
      parent: null,
    })),
    tokenType: 'session',
  },
};
