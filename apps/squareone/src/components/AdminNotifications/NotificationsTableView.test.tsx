import { mockAdminNotifications } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import NotificationsTableView from './NotificationsTableView';

describe('NotificationsTableView', () => {
  it('renders a loading state', () => {
    render(<NotificationsTableView notifications={undefined} isLoading />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders an error state with a retry control', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <NotificationsTableView
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

  it('renders recipient, sender, and a rendered Markdown summary', () => {
    render(
      <NotificationsTableView
        notifications={mockAdminNotifications.slice(0, 1)}
        totalCount={1}
      />
    );

    // recipient + sender of the first fixture
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bot-quota-notifier')).toBeInTheDocument();
    // The summary Markdown (`**quota**`) is rendered to a <strong> element.
    const emphasized = screen.getByText('quota');
    expect(emphasized.tagName).toBe('STRONG');

    // The summary now lives in a full-width detail row, not a column, so
    // there is no "Summary" column header.
    expect(
      screen.queryByRole('columnheader', { name: /Summary/ })
    ).not.toBeInTheDocument();
  });

  it('renders an empty state when there are no notifications', () => {
    render(<NotificationsTableView notifications={[]} totalCount={0} />);

    expect(screen.getByText(/no notifications match/i)).toBeInTheDocument();
  });

  it('shows a shown-of-total count', () => {
    render(
      <NotificationsTableView
        notifications={mockAdminNotifications.slice(0, 3)}
        totalCount={8}
      />
    );

    expect(screen.getByText(/showing 3 of 8/i)).toBeInTheDocument();
  });

  it('exposes a Load more control that invokes the handler', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(
      <NotificationsTableView
        notifications={mockAdminNotifications.slice(0, 3)}
        totalCount={8}
        hasMore
        onLoadMore={onLoadMore}
      />
    );

    await user.click(screen.getByRole('button', { name: /load more/i }));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('links the Compose button to the compose route', () => {
    render(<NotificationsTableView notifications={[]} />);

    expect(screen.getByRole('link', { name: /compose/i })).toHaveAttribute(
      'href',
      '/admin/notifications/new'
    );
  });

  it('links each summary to its detail page', () => {
    const notification = mockAdminNotifications[0];
    render(
      <NotificationsTableView notifications={[notification]} totalCount={1} />
    );

    expect(
      screen.getByRole('link', { name: /disk space quota limit/i })
    ).toHaveAttribute('href', `/admin/notifications/${notification.id}`);
  });
});
