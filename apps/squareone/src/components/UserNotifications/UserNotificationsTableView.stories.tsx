import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';

import RenderedMarkdown from '../RenderedMarkdown';
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
 * When a `renderExpandedBody` renderer is supplied, each row gains an expander
 * control that reveals the message body in place. The view owns the
 * expanded/collapsed state; the container supplies the body (fetched on demand)
 * and auto-marks it read.
 */
export const Expandable: Story = {
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    onShowUnreadOnlyChange: fn(),
    renderExpandedBody: (n) => (
      <RenderedMarkdown markdown={`Full message body for **${n.id}**.`} />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Bodies are hidden until a row is expanded.
    await expect(canvas.queryByText('ntf-001')).not.toBeInTheDocument();

    const expanders = canvas.getAllByRole('button', {
      name: /show message body/i,
    });
    await userEvent.click(expanders[0]);

    // The expanded row reveals its body (rendered Markdown), and the control
    // flips to a collapse affordance.
    await expect(canvas.getByText('ntf-001').tagName).toBe('STRONG');
    await expect(
      canvas.getByRole('button', { name: /hide message body/i })
    ).toBeInTheDocument();
  },
};

/**
 * Supplying `onMarkRead` / `onMarkAllRead` opts the table into row selection
 * (a leading checkbox column with select-all) plus a bulk-actions dropdown and
 * a "Mark all as read" button. The "Mark read" action is disabled until at
 * least one row is selected; selecting a row enables it, and choosing it marks
 * the selection read and clears it. The container owns the mutation (and the
 * shared cache invalidation that updates the list and header count).
 */
export const WithBulkActions: Story = {
  name: 'With bulk actions',
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    onShowUnreadOnlyChange: fn(),
    onMarkRead: fn(),
    onMarkAllRead: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // The bulk-actions dropdown is disabled until a row is selected.
    const bulkActions = canvas.getByRole('button', { name: /bulk actions/i });
    await expect(bulkActions).toBeDisabled();

    // "Mark all as read" calls back (the container enumerates + marks). Done
    // before opening the dropdown, since the modal menu makes the rest of the
    // page inert (aria-hidden) while open.
    await userEvent.click(
      canvas.getByRole('button', { name: /mark all as read/i })
    );
    await expect(args.onMarkAllRead).toHaveBeenCalled();

    // Selecting a row enables the dropdown; "Mark read" marks the selection.
    await userEvent.click(
      canvas.getAllByRole('checkbox', { name: /select row/i })[0]
    );
    await expect(bulkActions).toBeEnabled();
    await userEvent.click(bulkActions);

    // The dropdown content is portaled to the document body, so query the
    // screen rather than the canvas.
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /mark read/i })
    );
    await expect(args.onMarkRead).toHaveBeenCalledWith(['ntf-001']);
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
