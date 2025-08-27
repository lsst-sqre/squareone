import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { SWRConfig } from 'swr';
import { within, userEvent, screen, expect } from '@storybook/test';

import GafaelfawrUserMenu from './GafaelfawrUserMenu';

const meta: Meta<typeof GafaelfawrUserMenu> = {
  title: 'Components/GafaelfawrUserMenu',
  component: GafaelfawrUserMenu,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
    // The user menu always shows up on a dark background.
    globals: {
      backgrounds: { value: 'dark' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GafaelfawrUserMenu>;

const loggedInAuthHandlers = [
  http.get('/auth/api/v1/user-info', () => {
    return HttpResponse.json({
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
    });
  }),
];

const loggedOutAuthHandlers = [
  http.get('/auth/api/v1/user-info', () => {
    return new HttpResponse(null, { status: 401 });
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
        <GafaelfawrUserMenu.Link href="#">
          Account settings
        </GafaelfawrUserMenu.Link>
        <GafaelfawrUserMenu.Link href="#">
          Security tokens
        </GafaelfawrUserMenu.Link>
      </GafaelfawrUserMenu>
    </SWRConfig>
  ),
};
