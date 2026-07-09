import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Spy on the shared clipboard helper so "Copy link" can be asserted without a
// real Clipboard API; keep every other squared export (Button, Checkbox,
// DropdownMenu, …) live.
vi.mock('@lsst-sqre/squared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lsst-sqre/squared')>();
  return { ...actual, copyToClipboard: vi.fn() };
});

import { copyToClipboard } from '@lsst-sqre/squared';

import UserNotificationsTableView from './UserNotificationsTableView';

// Freeze "now" so relative dates are deterministic. Chosen so ntf-001 (created
// 2026-06-12T17:10:32Z) is exactly 18 days ago.
const NOW = new Date('2026-06-30T17:10:32Z').getTime();

describe('UserNotificationsTableView', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
    vi.mocked(copyToClipboard).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a loading state', () => {
    render(<UserNotificationsTableView notifications={undefined} isLoading />);

    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();
  });

  it('renders an error state with a retry control', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={undefined}
        error={new Error('Boom')}
        onRetry={onRetry}
      />
    );

    expect(
      screen.getByText(/failed to load notifications/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('surfaces the load failure via a squared ErrorMessage', () => {
    render(
      <UserNotificationsTableView
        notifications={undefined}
        error={new Error('Boom')}
      />
    );

    // The squared ErrorMessage renders with role="status"; asserting the
    // failure headline lives on it confirms the bespoke red banner was swapped
    // for the shared inline error component.
    expect(screen.getByRole('status')).toHaveTextContent(
      /failed to load notifications/i
    );
  });

  it('renders a relative date with an absolute UTC title and a rendered-Markdown summary', () => {
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
      />
    );

    // The created timestamp renders as a relative date with the absolute UTC
    // timestamp as its tooltip.
    const date = screen.getByTitle('2026-06-12 17:10 UTC');
    expect(date).toHaveTextContent('18 days ago');

    // The summary Markdown (`**quota**`) is rendered to a <strong> element.
    const emphasized = screen.getByText('quota');
    expect(emphasized.tagName).toBe('STRONG');
  });

  it('renders an empty state when the inbox is empty', () => {
    render(<UserNotificationsTableView notifications={[]} totalCount={0} />);

    expect(screen.getByText(/you have no notifications/i)).toBeInTheDocument();
  });

  it('renders an unread-specific empty state when filtering unread only', () => {
    render(
      <UserNotificationsTableView
        notifications={[]}
        totalCount={0}
        showUnreadOnly
      />
    );

    expect(
      screen.getByText(/you have no unread notifications/i)
    ).toBeInTheDocument();
  });

  it('hides the "Select all" checkbox when the list is empty', () => {
    render(
      <UserNotificationsTableView
        notifications={[]}
        totalCount={0}
        onMarkRead={vi.fn()}
      />
    );

    expect(
      screen.queryByRole('checkbox', { name: /select all/i })
    ).not.toBeInTheDocument();
  });

  it('hides the "Select all" checkbox when unread-only has no unread messages', () => {
    render(
      <UserNotificationsTableView
        notifications={[]}
        totalCount={0}
        showUnreadOnly
        onMarkRead={vi.fn()}
      />
    );

    expect(
      screen.queryByRole('checkbox', { name: /select all/i })
    ).not.toBeInTheDocument();
  });

  it('shows a shown-of-total count', () => {
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 3)}
        totalCount={6}
      />
    );

    expect(screen.getByText(/showing 3 of 6/i)).toBeInTheDocument();
  });

  it('exposes a Load more control that invokes the handler', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 3)}
        totalCount={6}
        hasMore
        onLoadMore={onLoadMore}
      />
    );

    await user.click(screen.getByRole('button', { name: /load more/i }));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('expands a row via the summary toggle and collapses it again', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
        renderExpandedBody={(n) => <div>Body for {n.id}</div>}
      />
    );

    // Bodies stay hidden until a row is expanded.
    expect(screen.queryByText('Body for ntf-001')).not.toBeInTheDocument();

    const toggles = screen.getAllByRole('button', { name: /show message/i });
    await user.click(toggles[0]);

    // The expanded row reveals its body; the other row stays collapsed.
    expect(screen.getByText('Body for ntf-001')).toBeInTheDocument();
    expect(screen.queryByText('Body for ntf-002')).not.toBeInTheDocument();

    // The control reflects the expanded state and collapses on a second click.
    const collapse = screen.getByRole('button', { name: /hide message/i });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await user.click(collapse);
    expect(screen.queryByText('Body for ntf-001')).not.toBeInTheDocument();
  });

  it('toggles expansion when the summary text itself is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
        renderExpandedBody={(n) => <div>Body for {n.id}</div>}
      />
    );

    // Clicking the emphasized summary text (inside the toggle) expands the row.
    await user.click(screen.getByText('quota'));
    expect(screen.getByText('Body for ntf-001')).toBeInTheDocument();
  });

  it('renders the summary as plain text (no toggle) when no expanded-body renderer is supplied', () => {
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
      />
    );

    expect(
      screen.queryByRole('button', { name: /show message/i })
    ).not.toBeInTheDocument();
  });

  it('shows no selection chrome without an onMarkRead handler', () => {
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
      />
    );

    expect(
      screen.queryByRole('checkbox', { name: /select all/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Actions' })
    ).not.toBeInTheDocument();
  });

  it('enables Actions once a row is selected and marks the selection read', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
        onMarkRead={onMarkRead}
      />
    );

    // No Actions dropdown until something is selected.
    expect(
      screen.queryByRole('button', { name: 'Actions' })
    ).not.toBeInTheDocument();

    // Select the first row (ntf-001).
    const rowCheckboxes = screen.getAllByRole('checkbox', {
      name: /select notification/i,
    });
    await user.click(rowCheckboxes[0]);

    // The Actions dropdown appears; open it and mark the selection read.
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    expect(onMarkRead).toHaveBeenCalledWith(['ntf-001']);
  });

  it('clears the selection after marking the selection read', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
        onMarkRead={onMarkRead}
      />
    );

    await user.click(
      screen.getAllByRole('checkbox', { name: /select notification/i })[0]
    );
    expect(
      screen.getAllByRole('checkbox', { name: /select notification/i })[0]
    ).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The selection is cleared, so the row checkbox is unchecked and the Actions
    // dropdown is gone again.
    expect(
      screen.getAllByRole('checkbox', { name: /select notification/i })[0]
    ).not.toBeChecked();
    expect(
      screen.queryByRole('button', { name: 'Actions' })
    ).not.toBeInTheDocument();
  });

  it('marks only the unread rows read when selecting all loaded rows', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 3)}
        totalCount={3}
        onMarkRead={onMarkRead}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // ntf-002 is already read, so only the unread ids are sent.
    expect(onMarkRead).toHaveBeenCalledWith(['ntf-001', 'ntf-003']);
  });

  it('offers select-all-across-pages when every loaded row is selected and more pages exist', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    const onMarkAllMatchingRead = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={12}
        hasMore
        onMarkRead={onMarkRead}
        onMarkAllMatchingRead={onMarkAllMatchingRead}
      />
    );

    // The extension banner only appears once all loaded rows are selected.
    expect(
      screen.queryByRole('button', { name: /select all 12 notifications/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));

    const extend = screen.getByRole('button', {
      name: /select all 12 notifications/i,
    });
    await user.click(extend);

    // With the selection extended across pages, "Mark as read" routes to the
    // across-pages handler rather than the loaded-only one.
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    expect(onMarkAllMatchingRead).toHaveBeenCalled();
    expect(onMarkRead).not.toHaveBeenCalled();
  });

  it('renders the select-all-across-pages banner as a squared info Note', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={12}
        hasMore
        onMarkRead={vi.fn()}
        onMarkAllMatchingRead={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));

    // The squared Note (type="info") renders an "Info" type badge in its corner
    // bubble; asserting it confirms the bespoke blue banner was swapped for the
    // shared callout.
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(
      screen.getByText(/all 6 on this page selected/i)
    ).toBeInTheDocument();
  });

  it('clears the selection once marking all matching read succeeds', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={12}
        hasMore
        onMarkRead={vi.fn()}
        onMarkAllMatchingRead={vi.fn().mockResolvedValue(undefined)}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The selection clears only after the handler's promise resolves.
    await waitFor(() => {
      expect(screen.queryByText(/all 12 selected/i)).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Actions' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the selection and shows an error when marking all matching read fails', async () => {
    const user = userEvent.setup();
    const onMarkAllMatchingRead = vi
      .fn()
      .mockRejectedValue(new Error('Semaphore API error: 500'));
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={12}
        hasMore
        onMarkRead={vi.fn()}
        onMarkAllMatchingRead={onMarkAllMatchingRead}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The rejection is surfaced inline (not an unhandled rejection)…
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/failed to mark notifications as read/i);
    expect(alert).toHaveTextContent(/semaphore api error: 500/i);

    // …and the selection is kept so the user can retry the action.
    expect(screen.getByText(/all 12 selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();

    // The failure is surfaced through the shared squared ErrorMessage, which
    // carries the "Failed to mark…" headline; keeping role="alert" preserves the
    // assertive announcement the bespoke banner had.
    expect(alert).toHaveTextContent(/failed to mark notifications as read/i);

    // Clearing the selection dismisses the error along with it.
    await user.click(screen.getByRole('button', { name: /clear selection/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cancels select-all-across-pages when a row is deselected, excluding it from Mark as read', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    const onMarkAllMatchingRead = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={12}
        hasMore
        onMarkRead={onMarkRead}
        onMarkAllMatchingRead={onMarkAllMatchingRead}
      />
    );

    // Select every loaded row, then extend the selection across pages.
    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    expect(screen.getByText(/all 12 selected/i)).toBeInTheDocument();

    // Deselecting one row cancels the across-pages extension: the banner
    // drops back and the selection becomes the loaded rows minus this one.
    await user.click(
      screen.getAllByRole('checkbox', { name: /select notification/i })[0]
    );
    expect(screen.queryByText(/all 12 selected/i)).not.toBeInTheDocument();
    expect(screen.getByText(/5 selected/i)).toBeInTheDocument();

    // "Mark as read" now targets only the still-selected unread rows — never
    // the whole filtered set, which would re-include the deselected row.
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    expect(onMarkAllMatchingRead).not.toHaveBeenCalled();
    expect(onMarkRead).toHaveBeenCalledWith(['ntf-003', 'ntf-004', 'ntf-006']);
  });

  it('renders newly loaded rows as selected while select-all-across-pages is active', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 3)}
        totalCount={12}
        hasMore
        onMarkRead={vi.fn()}
        onMarkAllMatchingRead={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );

    // Simulate "Load more" appending another page while "All 12 selected".
    rerender(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 6)}
        totalCount={12}
        hasMore
        onMarkRead={vi.fn()}
        onMarkAllMatchingRead={vi.fn()}
      />
    );

    // The fresh rows render checked, consistent with the banner state.
    expect(screen.getByText(/all 12 selected/i)).toBeInTheDocument();
    const rowCheckboxes = screen.getAllByRole('checkbox', {
      name: /select notification/i,
    });
    expect(rowCheckboxes).toHaveLength(6);
    for (const checkbox of rowCheckboxes) {
      expect(checkbox).toBeChecked();
    }
  });

  it('does not offer select-all-across-pages when there are no more pages', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={mockUserNotifications.length}
        onMarkRead={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));

    expect(
      screen.queryByRole('button', { name: /select all .* notifications/i })
    ).not.toBeInTheDocument();
  });

  it('shows Mark as read + Copy link for an unread row, Copy link only for a read row', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
        permalinkBase="https://example.test"
        onMarkRead={vi.fn()}
      />
    );

    const menus = screen.getAllByRole('button', {
      name: /notification actions/i,
    });

    // ntf-001 is unread → Mark as read + Copy link.
    await user.click(menus[0]);
    expect(
      screen.getByRole('menuitem', { name: /mark as read/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /copy link/i })
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    // ntf-002 is read → Copy link only.
    const menusAgain = screen.getAllByRole('button', {
      name: /notification actions/i,
    });
    await user.click(menusAgain[1]);
    expect(
      screen.queryByRole('menuitem', { name: /mark as read/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /copy link/i })
    ).toBeInTheDocument();
  });

  it('copies the absolute permalink when "Copy link" is chosen', async () => {
    const user = userEvent.setup();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 1)}
        totalCount={1}
        permalinkBase="https://example.test"
        onMarkRead={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /notification actions/i })
    );
    await user.click(screen.getByRole('menuitem', { name: /copy link/i }));

    expect(copyToClipboard).toHaveBeenCalledWith(
      'https://example.test/notifications/ntf-001'
    );
  });

  it('reflects and toggles the "Show unread only" control', async () => {
    const user = userEvent.setup();
    const onShowUnreadOnlyChange = vi.fn();
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications}
        totalCount={mockUserNotifications.length}
        showUnreadOnly={false}
        onShowUnreadOnlyChange={onShowUnreadOnlyChange}
      />
    );

    const toggle = screen.getByRole('checkbox', {
      name: /show unread only/i,
    });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(onShowUnreadOnlyChange).toHaveBeenCalledWith(true);
  });
});
