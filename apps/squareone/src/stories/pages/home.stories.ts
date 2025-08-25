import type { Meta, StoryObj } from '@storybook/react';
import Home from '../../pages/index';

const meta: Meta<typeof Home> = {
  title: 'Pages/Homepage',
  component: Home,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Homepage: Story = {
  args: {},
};
