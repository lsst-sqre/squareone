import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

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
 * The default loaded view: a flat list of rows with an unread dot, a rendered-
 * Markdown summary, a relative date (with the absolute UTC timestamp as its
 * tooltip), a per-row "…" menu, a shown-of-total count, and the "Show unread
 * only" toggle.
 */
export const Loaded: Story = {
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    onShowUnreadOnlyChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The date renders relative, with the absolute UTC timestamp as its tooltip.
    const date = canvas.getByTitle('2026-06-12 17:10 UTC');
    await expect(date).toHaveTextContent(/ago/);

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
 * When a `renderExpandedBody` renderer is supplied, the chevron+summary becomes
 * a toggle that reveals the message body in place. Clicking the chevron or the
 * summary text expands the row; the view owns the expanded/collapsed state while
 * the container supplies the body (fetched on demand) and auto-marks it read.
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

    // Clicking the summary text itself toggles the body open.
    await userEvent.click(canvas.getByText('quota'));

    // The expanded row reveals its body (rendered Markdown), and the toggle
    // flips to a collapse affordance.
    await expect(canvas.getByText('ntf-001').tagName).toBe('STRONG');
    await expect(
      canvas.getByRole('button', { name: /hide message/i })
    ).toBeInTheDocument();
  },
};

/**
 * Supplying `onMarkRead` opts the inbox into row selection: a per-row checkbox
 * and a toolbar "Select all" checkbox, plus an "Actions" dropdown that appears
 * once at least one row is selected. Choosing "Mark as read" marks the unread
 * members of the selection read and clears it. The container owns the mutation
 * (and the shared cache invalidation that updates the list and header count).
 */
export const WithSelection: Story = {
  name: 'With selection',
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    onShowUnreadOnlyChange: fn(),
    onMarkRead: fn(),
    permalinkBase: 'https://example.test',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // No Actions dropdown until a row is selected.
    await expect(
      canvas.queryByRole('button', { name: 'Actions' })
    ).not.toBeInTheDocument();

    // Selecting a row reveals the Actions dropdown; "Mark as read" marks it.
    await userEvent.click(
      canvas.getAllByRole('checkbox', { name: /select notification/i })[0]
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));

    // The dropdown content is portaled to the document body, so query the
    // screen rather than the canvas.
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /mark as read/i })
    );
    await expect(args.onMarkRead).toHaveBeenCalledWith(['ntf-001']);
  },
};

/**
 * Two-tier select-all (GitHub style): "Select all" selects the loaded rows, and
 * when more pages exist a banner offers to extend the selection to the whole
 * filtered set. "Mark as read" then routes to `onMarkAllMatchingRead`, which the
 * container backs by enumerating the unread ids across all pages.
 */
export const SelectAllAcrossPages: Story = {
  name: 'Select all across pages',
  args: {
    notifications: mockUserNotifications.slice(0, 3),
    totalCount: 9,
    hasMore: true,
    onLoadMore: fn(),
    onShowUnreadOnlyChange: fn(),
    onMarkRead: fn(),
    onMarkAllMatchingRead: fn(),
    permalinkBase: 'https://example.test',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Select the loaded rows, then extend the selection across pages.
    await userEvent.click(
      canvas.getByRole('checkbox', { name: /select all/i })
    );

    // The extension prompt renders via the shared squared Note (type="info").
    await expect(canvas.getByText('Info')).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: /select all 9 notifications/i })
    );

    // "Mark as read" now targets the whole filtered set.
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /mark as read/i })
    );
    await expect(args.onMarkAllMatchingRead).toHaveBeenCalled();
  },
};

/**
 * Each row carries an always-visible "…" menu. Unread rows offer "Mark as read"
 * and "Copy link"; read rows offer "Copy link" only. "Copy link" copies the
 * absolute `${permalinkBase}/notifications/{id}` permalink.
 */
export const PerRowMenu: Story = {
  name: 'Per-row menu',
  args: {
    notifications: mockUserNotifications.slice(0, 2),
    totalCount: 2,
    onShowUnreadOnlyChange: fn(),
    onMarkRead: fn(),
    permalinkBase: 'https://example.test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const menus = canvas.getAllByRole('button', {
      name: /notification actions/i,
    });

    // ntf-001 is unread → Mark as read + Copy link.
    await userEvent.click(menus[0]);
    await expect(
      await screen.findByRole('menuitem', { name: /mark as read/i })
    ).toBeInTheDocument();
    await expect(
      screen.getByRole('menuitem', { name: /copy link/i })
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    // Wait for the first menu to fully close: while it is open Radix marks the
    // other triggers aria-hidden, so they are unreachable by role until then.
    await waitFor(() =>
      expect(
        screen.queryByRole('menuitem', { name: /copy link/i })
      ).not.toBeInTheDocument()
    );

    // ntf-002 is read → Copy link only.
    await userEvent.click(
      canvas.getAllByRole('button', { name: /notification actions/i })[1]
    );
    await expect(
      await screen.findByRole('menuitem', { name: /copy link/i })
    ).toBeInTheDocument();
    await expect(
      screen.queryByRole('menuitem', { name: /mark as read/i })
    ).not.toBeInTheDocument();
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

    // The load failure surfaces through the shared squared ErrorMessage
    // (role="status") rather than a bespoke red banner.
    await expect(canvas.getByRole('status')).toHaveTextContent(
      /failed to load notifications/i
    );
    await expect(
      canvas.getByText('Semaphore is unavailable')
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /retry/i }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/**
 * The loaded list under the dark toolbar theme, so the migration to adaptive
 * `--rsd-component-*` tokens is visually verifiable in dark mode and can't
 * silently rot. Pins the `withThemeByDataAttribute` global to `dark` so the
 * toolbar renders the story with `data-theme="dark"` (toggle the toolbar theme
 * to compare against the light stories above).
 */
export const Dark: Story = {
  args: {
    notifications: mockUserNotifications,
    totalCount: mockUserNotifications.length,
    onShowUnreadOnlyChange: fn(),
  },
  globals: {
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(/showing 6 of 6 notifications/i)
    ).toBeInTheDocument();
  },
};
