import type { AdminNotificationFilters } from '@lsst-sqre/semaphore-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import NotificationFilters from './NotificationFilters';

const meta: Meta<typeof NotificationFilters> = {
  title: 'Components/AdminNotifications/NotificationFilters',
  component: NotificationFilters,
  parameters: {
    layout: 'padded',
  },
  args: {
    filters: {} as AdminNotificationFilters,
    onFilterChange: fn(),
    onClearFilters: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The filter bar with recipient/sender text inputs, since/until date-time
 * pickers, and a clear-all control.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByLabelText(/filter by recipient/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText(/filter by sender/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /clear all filters/i })
    ).toBeInTheDocument();
  },
};

/**
 * The filter bar under the dark toolbar theme, so the migration to adaptive
 * `--rsd-component-*` tokens (labels, dividers, control surfaces) is visually
 * verifiable in dark mode and can't silently rot. Pins the
 * `withThemeByDataAttribute` global to `dark` so the toolbar renders the story
 * with `data-theme="dark"` (toggle the toolbar theme to compare against the
 * light story above).
 */
export const Dark: Story = {
  globals: {
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByLabelText(/filter by recipient/i)
    ).toBeInTheDocument();
  },
};
