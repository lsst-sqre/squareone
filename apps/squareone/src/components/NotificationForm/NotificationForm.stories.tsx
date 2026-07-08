import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import NotificationForm from './NotificationForm';

const meta: Meta<typeof NotificationForm> = {
  title: 'Components/NotificationForm',
  component: NotificationForm,
  args: {
    onSubmit: async () => {},
    isSubmitting: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof NotificationForm>;

/**
 * The default, fully-enabled compose form an admin with `admin:notifications`
 * sees.
 */
export const Loaded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/recipient/i)).toBeEnabled();
    await expect(canvas.getByLabelText(/summary/i)).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: /send notification/i })
    ).toBeEnabled();

    // The summary preview updates live as inline Markdown is typed.
    await userEvent.type(canvas.getByLabelText(/summary/i), 'a **bold** word');
    const strong = await canvas.findByText('bold');
    await expect(strong.tagName).toBe('STRONG');
  },
};

/**
 * Prefilled from query-string parameters, as when a notification is drafted from
 * an operational run book.
 */
export const Prefilled: Story = {
  args: {
    initialValues: {
      recipient: 'rachel',
      summary: 'Your **quota** is almost full.',
      body: '## Action needed\n\nPlease clear some files.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/recipient/i)).toHaveValue('rachel');
    await expect(
      canvas.getByRole('heading', { name: 'Action needed' })
    ).toBeInTheDocument();
  },
};

/**
 * Gated state shown to an admin lacking the `admin:notifications` scope: every
 * field and the submit button are disabled. The explanatory `Note` lives on the
 * compose page alongside this disabled form.
 */
export const NoAdminNotificationsScope: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/recipient/i)).toBeDisabled();
    await expect(canvas.getByLabelText(/summary/i)).toBeDisabled();
    await expect(canvas.getByLabelText(/^body/i)).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: /send notification/i })
    ).toBeDisabled();
  },
};

/**
 * A failed send surfaces a clear inline error without discarding the operator's
 * input.
 */
export const SubmitError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error('Semaphore is unavailable.');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/recipient/i), 'rachel');
    await userEvent.type(canvas.getByLabelText(/summary/i), 'Heads up');
    await userEvent.click(
      canvas.getByRole('button', { name: /send notification/i })
    );

    await expect(
      await canvas.findByText(/semaphore is unavailable/i)
    ).toBeInTheDocument();
    // Input is preserved through the failure.
    await expect(canvas.getByLabelText(/recipient/i)).toHaveValue('rachel');
  },
};

/**
 * The compose form under the dark toolbar theme, so the migration to adaptive
 * `--rsd-component-*` tokens (labels, help text, dividers) is visually
 * verifiable in dark mode and can't silently rot. Pins the
 * `withThemeByDataAttribute` global to `dark` so the toolbar renders the story
 * with `data-theme="dark"` (toggle the toolbar theme to compare against the
 * light stories above).
 */
export const Dark: Story = {
  globals: {
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/recipient/i)).toBeEnabled();
  },
};
