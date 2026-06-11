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
    await expect(
      canvas.getByRole('button', { name: /create service token/i })
    ).toBeInTheDocument();
  },
};

export const Prefilled: Story = {
  args: {
    initialValues: {
      username: 'bot-example',
      scopes: ['read:tap', 'exec:notebook'],
      expiration: { type: 'never' },
    },
  },
};

export const Submitting: Story = {
  args: {
    initialValues: {
      username: 'bot-example',
      scopes: ['read:tap'],
      expiration: { type: 'never' },
    },
    isSubmitting: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/bot username/i)).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: /create service token/i })
    ).toBeDisabled();
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

export const WithCancel: Story = {
  args: {
    onCancel: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // When onCancel is provided, a secondary Cancel button sits beside submit.
    await expect(
      canvas.getByRole('button', { name: /create service token/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();
  },
};

export const AdvancedSettings: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The advanced section is collapsed by default; expand it to reveal the
    // optional identity fields.
    await userEvent.click(canvas.getByText(/advanced settings/i));
    await expect(canvas.getByLabelText('Name')).toBeVisible();
    await expect(canvas.getByLabelText('UID')).toBeVisible();
    await expect(canvas.getByLabelText('Groups')).toBeVisible();
  },
};
