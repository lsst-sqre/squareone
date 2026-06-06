import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { Scope } from '../TokenForm';
import ServiceTokenForm from './ServiceTokenForm';

const mockScopes: Scope[] = [
  { name: 'read:tap', description: 'Read access to the TAP service' },
  { name: 'read:image', description: 'Read access to images' },
  { name: 'exec:notebook', description: 'Can execute notebooks' },
  { name: 'exec:portal', description: 'Can access the science portal' },
  { name: 'admin:token', description: 'Can create and manage all tokens' },
];

const meta: Meta<typeof ServiceTokenForm> = {
  title: 'Components/ServiceTokenForm',
  component: ServiceTokenForm,
  args: {
    availableScopes: mockScopes,
    onSubmit: async () => {},
    isSubmitting: false,
  },
};

export default meta;
type Story = StoryObj<typeof ServiceTokenForm>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/bot username/i)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/token name/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /create service token/i })
    ).toBeInTheDocument();
  },
};

export const Prefilled: Story = {
  args: {
    initialValues: {
      username: 'bot-example',
      name: 'CI pipeline token',
      scopes: ['read:tap', 'exec:notebook'],
      expiration: { type: 'never' },
    },
  },
};

export const Submitting: Story = {
  args: {
    initialValues: {
      username: 'bot-example',
      name: 'CI pipeline token',
      scopes: ['read:tap'],
      expiration: { type: 'never' },
    },
    isSubmitting: true,
  },
};

export const RejectsInvalidUsername: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/bot username/i), 'alice');
    await userEvent.click(
      canvas.getByRole('button', { name: /create service token/i })
    );
    await expect(
      await canvas.findByText(/must start with "bot-"/i)
    ).toBeInTheDocument();
  },
};
