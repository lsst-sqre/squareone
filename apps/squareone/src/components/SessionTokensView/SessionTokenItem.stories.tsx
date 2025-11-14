import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import type { TokenInfo } from '../../hooks/useUserTokens';
import SessionTokenItem from './SessionTokenItem';

// Mock token data
const now = Math.floor(Date.now() / 1000);

const baseWebSessionToken: TokenInfo = {
  username: 'testuser',
  token_type: 'session',
  service: null,
  scopes: ['read:image', 'read:tap', 'user:token'],
  token: 'wB3cD5eF7gH9iJ1kL2mN4o',
  token_name: 'web-session',
  created: now - 3600, // 1 hour ago
  expires: now + 3600 * 24, // 24 hours from now
  parent: null,
};

const baseNotebookToken: TokenInfo = {
  username: 'testuser',
  token_type: 'notebook',
  service: null,
  scopes: ['exec:notebook', 'read:image', 'read:tap', 'write:files'],
  token: 'fG5hJ7kL9mN1pQ3rS5tU7v',
  token_name: 'notebook-session',
  created: now - 86400, // 1 day ago
  expires: now + 86400 * 7, // 7 days from now
  parent: null,
};

const baseInternalToken: TokenInfo = {
  username: 'testuser',
  token_type: 'internal',
  service: null,
  scopes: ['read:all', 'write:all', 'exec:admin'],
  token: 'L2mN4oP6qR8sT0uV2wX4yZ',
  token_name: 'internal-token',
  created: now - 86400 * 30, // 30 days ago
  expires: now + 86400 * 90, // 90 days from now
  parent: null,
};

const meta = {
  title: 'Components/SessionTokensView/SessionTokenItem',
  component: SessionTokenItem,
  parameters: {
    layout: 'padded',
  },
  args: {
    username: 'testuser',
    onDeleteSuccess: fn(),
    onDeleteError: fn(),
  },
} satisfies Meta<typeof SessionTokenItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WebSession: Story = {
  args: {
    token: baseWebSessionToken,
  },
};

export const NotebookSession: Story = {
  args: {
    token: baseNotebookToken,
  },
};

export const InternalToken: Story = {
  args: {
    token: baseInternalToken,
  },
};

export const NeverExpires: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      expires: null,
    },
  },
};

export const ExpiringToday: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      expires: now + 3600 * 12, // 12 hours from now
    },
  },
};

export const ExpiringInDays: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      expires: now + 86400 * 3, // 3 days from now
    },
  },
};

export const Expired: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      expires: now - 86400, // Yesterday
    },
  },
};

export const ManyScopes: Story = {
  args: {
    token: {
      ...baseNotebookToken,
      scopes: [
        'exec:admin',
        'exec:notebook',
        'exec:portal',
        'read:image',
        'read:tap',
        'write:files',
        'write:sasquatch',
      ],
    },
  },
};

export const SingleScope: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      scopes: ['read:image'],
    },
  },
};

export const NoScopes: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      scopes: [],
    },
  },
};

export const WithoutTokenName: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      token_name: undefined,
    },
  },
};

export const LongTokenName: Story = {
  args: {
    token: {
      ...baseWebSessionToken,
      token_name: 'my-very-long-web-session-token-name-for-testing-layout',
    },
  },
};

export const ScopeColorVariants: Story = {
  args: {
    token: {
      ...baseNotebookToken,
      scopes: ['exec:notebook', 'read:tap', 'write:files', 'user:token'],
    },
  },
};
