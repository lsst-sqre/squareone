import type { UserNotification } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NotificationDetailView from './NotificationDetailView';

const baseNotification: UserNotification = {
  id: 'ntf-001',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'bot-quota-notifier',
  recipient: 'alice',
  summary: 'You are approaching your disk space **quota** limit',
  body: 'You are using **448GiB** of disk out of a quota of 500GiB.',
};

describe('NotificationDetailView', () => {
  it('renders the full metadata and the rendered-Markdown body', () => {
    render(<NotificationDetailView notification={baseNotification} />);

    // Full metadata: id, recipient, sender, created, read status.
    expect(screen.getByText('ntf-001')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bot-quota-notifier')).toBeInTheDocument();
    expect(screen.getByText('2026-06-12 17:10 UTC')).toBeInTheDocument();

    // The body is rendered as Markdown (the bold word becomes its own element),
    // not shown as raw `**448GiB**` text.
    expect(screen.getByText('448GiB')).toBeInTheDocument();
    expect(screen.queryByText(/\*\*448GiB\*\*/)).not.toBeInTheDocument();

    // The summary is rendered too (bold word is emphasised, not literal).
    expect(screen.getByText('quota')).toBeInTheDocument();
  });

  it('shows "Unread" when the notification has not been read', () => {
    render(<NotificationDetailView notification={baseNotification} />);

    expect(screen.getByText('Unread')).toBeInTheDocument();
  });

  it('shows the read timestamp when the notification has been read', () => {
    render(
      <NotificationDetailView
        notification={{
          ...baseNotification,
          read: '2026-06-12T18:00:00+00:00',
        }}
      />
    );

    expect(screen.getByText('2026-06-12 18:00 UTC')).toBeInTheDocument();
    expect(screen.queryByText('Unread')).not.toBeInTheDocument();
  });

  it('shows a no-body placeholder when the body is null', () => {
    render(
      <NotificationDetailView
        notification={{ ...baseNotification, body: null }}
      />
    );

    expect(
      screen.getByText('This notification has no body.')
    ).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<NotificationDetailView isLoading />);

    expect(screen.getByText('Loading notification…')).toBeInTheDocument();
  });

  it('shows a graceful not-found state for a 404 error', () => {
    const error = Object.assign(
      new Error('Semaphore API error: 404 Not Found'),
      {
        statusCode: 404,
      }
    );

    render(<NotificationDetailView error={error} />);

    expect(screen.getByText('Notification not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Return to notifications' })
    ).toHaveAttribute('href', '/admin/notifications');
  });

  it('shows a not-found state when there is neither data nor error', () => {
    render(<NotificationDetailView />);

    expect(screen.getByText('Notification not found')).toBeInTheDocument();
  });

  it('shows a generic error state for a non-404 error', () => {
    render(<NotificationDetailView error={new Error('Network down')} />);

    expect(screen.getByText('Error loading notification')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Return to notifications' })
    ).toBeInTheDocument();
  });

  it('points the back link at a custom returnHref', () => {
    render(
      <NotificationDetailView
        notification={baseNotification}
        returnHref="/admin/notifications?recipient=alice"
      />
    );

    expect(
      screen.getByRole('link', { name: /Back to notifications/ })
    ).toHaveAttribute('href', '/admin/notifications?recipient=alice');
  });
});
