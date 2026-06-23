import { mockAdminNotifications } from '@lsst-sqre/semaphore-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import NotificationsTableView from './NotificationsTableView';

const meta: Meta<typeof NotificationsTableView> = {
  title: 'Components/AdminNotifications/NotificationsTableView',
  component: NotificationsTableView,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default loaded view: a table of notifications with a shown-of-total
 * count and a Compose button.
 */
export const Loaded: Story = {
  args: {
    notifications: mockAdminNotifications,
    totalCount: mockAdminNotifications.length,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Recipient and sender of the fixtures render in the table (recipients
    // recur across rows, so there is more than one "alice").
    await expect(canvas.getAllByText('alice').length).toBeGreaterThan(0);
    await expect(
      canvas.getAllByText('bot-quota-notifier').length
    ).toBeGreaterThan(0);

    // The summary Markdown renders to HTML (the `**quota**` emphasis).
    const emphasized = canvas.getByText('quota');
    await expect(emphasized.tagName).toBe('STRONG');

    // The shown-of-total count and Compose button are present.
    await expect(
      canvas.getByText(/showing 8 of 8 notifications/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: /compose/i })
    ).toHaveAttribute('href', '/admin/notifications/new');

    // Each summary links to its per-notification detail page.
    await expect(
      canvas.getByRole('link', { name: /disk space quota limit/i })
    ).toHaveAttribute('href', '/admin/notifications/ntf-001');
  },
};

/**
 * "Load more" is shown when more pages are available; loading is owned by the
 * caller and reflected on the button.
 */
export const WithLoadMore: Story = {
  name: 'With load more',
  args: {
    notifications: mockAdminNotifications.slice(0, 5),
    totalCount: mockAdminNotifications.length,
    hasMore: true,
    onLoadMore: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const loadMore = canvas.getByRole('button', { name: /load more/i });
    await userEvent.click(loadMore);
    await expect(args.onLoadMore).toHaveBeenCalled();
  },
};

/** The initial loading state, before the first page resolves. */
export const Loading: Story = {
  args: {
    notifications: undefined,
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/loading notifications/i)
    ).toBeInTheDocument();
  },
};

/** The empty state, when the query succeeds but matches nothing. */
export const Empty: Story = {
  args: {
    notifications: [],
    totalCount: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/no notifications match your filters/i)
    ).toBeInTheDocument();
  },
};

/** The error state, with a retry affordance that calls back to the caller. */
export const ErrorState: Story = {
  name: 'Error',
  args: {
    notifications: undefined,
    error: new Error('Semaphore is unavailable'),
    onRetry: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(/failed to load notifications/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Semaphore is unavailable')
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /retry/i }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};
