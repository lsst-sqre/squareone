import type { Meta, StoryObj } from '@storybook/react';
import { rest } from 'msw';
import { SWRConfig } from 'swr';

import GafaelfawrUserMenu from './GafaelfawrUserMenu';

const meta: Meta<typeof GafaelfawrUserMenu> = {
  title: 'Components/GafaelfawrUserMenu',
  component: GafaelfawrUserMenu,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
    // The user menu always shows up on a dark background.
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2121' }],
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GafaelfawrUserMenu>;

export const Default: Story = {
  args: {
    currentUrl: 'http://localhost:6006/somepage',
  },

  parameters: {
    msw: {
      handlers: {
        auth: [
          rest.get('/auth/api/v1/user-info', (req, res, ctx) => {
            return res(
              ctx.json({
                username: 'someuser',
                name: 'Alice Example',
                email: 'alice@example.com',
                uid: 4123,
                gid: 4123,
                groups: [
                  {
                    name: 'g_special_users',
                    id: 123181,
                  },
                ],
                quota: {
                  api: {},
                  notebook: {
                    cpu: 4,
                    memory: 16,
                  },
                },
              })
            );
          }),
        ],
      },
    },
  },

  render: (args) => (
    <SWRConfig value={{ provider: () => new Map() }}>
      <GafaelfawrUserMenu {...args}>
        <GafaelfawrUserMenu.Item>
          <a href="#">Account Settings</a>
        </GafaelfawrUserMenu.Item>
        <GafaelfawrUserMenu.Item>
          <a href="#">Security tokens</a>
        </GafaelfawrUserMenu.Item>
      </GafaelfawrUserMenu>
    </SWRConfig>
  ),
};

export const LoggedOut: Story = {
  args: { ...Default.args },

  parameters: {
    msw: {
      handlers: {
        auth: [
          rest.get('/auth/api/v1/user-info', (req, res, ctx) => {
            return res(ctx.status(401));
          }),
        ],
      },
    },
  },
};
