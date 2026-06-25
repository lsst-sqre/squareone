import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import UserNotificationsTableView from './UserNotificationsTableView';

describe('UserNotificationsTableView', () => {
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

  it('renders the date, read status, and a rendered Markdown summary', () => {
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
      />
    );

    // The created timestamp is formatted to a UTC date string.
    expect(screen.getByText('2026-06-12 17:10 UTC')).toBeInTheDocument();

    // The first fixture is unread, the second is read.
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();

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

  it('expands a row in place to reveal the body and collapses it again', async () => {
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

    const expanders = screen.getAllByRole('button', {
      name: /show message body/i,
    });
    await user.click(expanders[0]);

    // The expanded row reveals its body; the other row stays collapsed.
    expect(screen.getByText('Body for ntf-001')).toBeInTheDocument();
    expect(screen.queryByText('Body for ntf-002')).not.toBeInTheDocument();

    // The control reflects the expanded state and collapses on a second click.
    const collapse = screen.getByRole('button', { name: /hide message body/i });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await user.click(collapse);
    expect(screen.queryByText('Body for ntf-001')).not.toBeInTheDocument();
  });

  it('shows no expander when no expanded-body renderer is supplied', () => {
    render(
      <UserNotificationsTableView
        notifications={mockUserNotifications.slice(0, 2)}
        totalCount={2}
      />
    );

    expect(
      screen.queryByRole('button', { name: /show message body/i })
    ).not.toBeInTheDocument();
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
