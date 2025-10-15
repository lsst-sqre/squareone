import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import AccessTokenItem from './AccessTokenItem';
import type { TokenInfo } from '../../hooks/useUserTokens';

// Mock token data
const baseToken: TokenInfo = {
  username: 'testuser',
  token_type: 'user',
  service: null,
  scopes: ['read:image', 'read:tap', 'user:token'],
  token: '4dE8wPjqh1MY0zsD8svAHQ',
  token_name: 'my-token',
  created: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
  expires: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
  parent: null,
};

const meta = {
  title: 'Components/AccessTokensView/AccessTokenItem',
  component: AccessTokenItem,
  parameters: {
    layout: 'padded',
  },
  args: {
    username: 'testuser',
    onDeleteSuccess: fn(),
    onDeleteError: fn(),
  },
} satisfies Meta<typeof AccessTokenItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    token: baseToken,
  },
};

export const NeverExpires: Story = {
  args: {
    token: {
      ...baseToken,
      expires: null,
    },
  },
};

export const ExpiringToday: Story = {
  args: {
    token: {
      ...baseToken,
      expires: Math.floor(Date.now() / 1000) + 3600 * 12, // 12 hours from now
    },
  },
};

export const ExpiringInDays: Story = {
  args: {
    token: {
      ...baseToken,
      expires: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
    },
  },
};

export const Expired: Story = {
  args: {
    token: {
      ...baseToken,
      expires: Math.floor(Date.now() / 1000) - 86400, // Yesterday
    },
  },
};

export const ManyScopes: Story = {
  args: {
    token: {
      ...baseToken,
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
      ...baseToken,
      scopes: ['read:image'],
    },
  },
};

export const LongTokenName: Story = {
  args: {
    token: {
      ...baseToken,
      token_name: 'my-very-long-token-name-for-testing-layout-behavior',
    },
  },
};

export const NoScopes: Story = {
  args: {
    token: {
      ...baseToken,
      scopes: [],
    },
  },
};

export const ScopeColorVariants: Story = {
  args: {
    token: {
      ...baseToken,
      scopes: ['exec:notebook', 'read:tap', 'write:files', 'user:token'],
    },
  },
};

export const WithDeleteError: Story = {
  args: {
    token: baseToken,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates the error state that appears when a token deletion fails. To see this state in action, click the Delete button, confirm the deletion, and the component will display an error message below the delete button. The actual error requires mocking the fetch API which is complex in Storybook tests.',
      },
    },
  },
};
