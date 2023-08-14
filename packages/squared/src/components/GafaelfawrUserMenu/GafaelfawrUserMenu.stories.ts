import type { Meta, StoryObj } from '@storybook/react';

import GafaelfawrUserMenu from './GafaelfawrUserMenu';

const meta = {
  title: 'Components/GafaelfawrUserMenu',
  component: GafaelfawrUserMenu,
} satisfies Meta<typeof GafaelfawrUserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'User Menu', loggedIn: true },
};

export const LoggedOut: Story = {
  args: { children: 'User Menu', loggedIn: false },
};
