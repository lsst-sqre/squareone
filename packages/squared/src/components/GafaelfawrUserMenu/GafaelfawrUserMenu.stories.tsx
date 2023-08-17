import type { Meta, StoryObj } from '@storybook/react';
import { rest } from 'msw';
import { SWRConfig } from 'swr';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

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

const loggedInAuthHandlers = [
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
];

const loggedOutAuthHandlers = [
  rest.get('/auth/api/v1/user-info', (req, res, ctx) => {
    return res(ctx.status(401));
  }),
];

export const Default: Story = {
  args: {
    currentUrl: 'http://localhost:6006/somepage',
  },

  parameters: {
    msw: {
      handlers: {
        auth: loggedInAuthHandlers,
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
        auth: loggedOutAuthHandlers,
      },
    },
  },
};

export const OpenedMenu: Story = {
  args: { ...Default.args },

  parameters: { ...Default.parameters },

  play: async ({ canvasElement }) => {
    // Delay so msw can load
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    await delay(1000);

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    // FIXME the canvas doesn't contain the menu.
    // I think that's because radix adds the dropdown outside the
    // story root.
    // await expect(canvas.getByText('Log out')).toBeInTheDocument();
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
