import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import DeleteTokenModal from './DeleteTokenModal';

const meta = {
  title: 'Components/AccessTokensView/DeleteTokenModal',
  component: DeleteTokenModal,
  parameters: {
    layout: 'centered',
  },
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof DeleteTokenModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    tokenName: 'my-token',
    isDeleting: false,
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    tokenName: 'my-token',
    isDeleting: true,
  },
};

export const LongTokenName: Story = {
  args: {
    isOpen: true,
    tokenName: 'my-very-long-token-name-that-should-wrap-correctly',
    isDeleting: false,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    tokenName: 'my-token',
    isDeleting: false,
  },
};
