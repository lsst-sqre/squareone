import type { Meta, StoryObj } from '@storybook/react';

import GafaelfawrUserMenu from './GafaelfawrUserMenu';

const meta: Meta<typeof GafaelfawrUserMenu> = {
  title: 'Components/GafaelfawrUserMenu',
  component: GafaelfawrUserMenu,
};

export default meta;
type Story = StoryObj<typeof GafaelfawrUserMenu>;

export const Default: Story = {
  args: {
    loggedIn: true,
    loginHref: '/login',
    logoutHref: '/logout',
  },

  render: (args) => (
    <GafaelfawrUserMenu {...args}>
      <GafaelfawrUserMenu.MenuItem>
        <a href="#">Account Settings</a>
      </GafaelfawrUserMenu.MenuItem>
      <GafaelfawrUserMenu.MenuItem>
        <a href="#">Security tokens</a>
      </GafaelfawrUserMenu.MenuItem>
    </GafaelfawrUserMenu>
  ),
};

export const LoggedOut: Story = {
  args: { ...Default.args, loggedIn: false },
};
