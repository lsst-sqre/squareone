import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import UserNotificationsTableView from './UserNotificationsTableView';

const meta: Meta<typeof UserNotificationsTableView> = {
  title: 'Components/UserNotifications/UserNotificationsTableView',
  component: UserNotificationsTableView,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default loaded view: the user's notifications with date, read status, a
 * rendered-Markdown summary per row, a shown-of-total count, and the "Show
 * unread only" toggle.
 */
export const Loaded: Story = {
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    onShowUnreadOnlyChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The fixtures cover both read and unread statuses.
    await expect(canvas.getAllByText('Unread').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Read').length).toBeGreaterThan(0);

    // The summary Markdown renders to HTML (the `**quota**` emphasis).
    const emphasized = canvas.getByText('quota');
    await expect(emphasized.tagName).toBe('STRONG');

    // The shown-of-total count and the unread toggle are present.
    await expect(
      canvas.getByText(/showing 6 of 6 notifications/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('checkbox', { name: /show unread only/i })
    ).toBeInTheDocument();
  },
};

/**
 * Toggling "Show unread only" calls back to the caller, which owns the filter
 * state and re-queries.
 */
export const TogglesUnreadOnly: Story = {
  name: 'Toggles unread only',
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    showUnreadOnly: false,
    onShowUnreadOnlyChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('checkbox', {
      name: /show unread only/i,
    });
    await userEvent.click(toggle);
    await expect(args.onShowUnreadOnlyChange).toHaveBeenCalledWith(true);
  },
};

/**
 * "Load more" is shown when more pages are available; loading is owned by the
 * caller and reflected on the button.
 */
export const WithLoadMore: Story = {
  name: 'With load more',
  args: {
    notifications: mockUserNotifications.slice(0, 3),
    totalCount: mockUserNotifications.length,
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

/** The empty state for an inbox with no notifications. */
export const Empty: Story = {
  args: {
    notifications: [],
    totalCount: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/you have no notifications/i)
    ).toBeInTheDocument();
  },
};

/** The empty state when the unread-only filter matches nothing. */
export const EmptyUnread: Story = {
  name: 'Empty (unread only)',
  args: {
    notifications: [],
    totalCount: 0,
    showUnreadOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/you have no unread notifications/i)
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
