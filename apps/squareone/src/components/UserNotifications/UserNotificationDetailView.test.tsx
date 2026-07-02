import type { UserNotificationFormatted } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { formatLocalTimestamp } from '../../lib/utils/dateFormatters';
import UserNotificationDetailView from './UserNotificationDetailView';

const baseNotification: UserNotificationFormatted = {
  id: 'ntf-001',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  summary: {
    gfm: 'You are approaching your disk space **quota** limit',
    html: '<p>You are approaching your disk space <strong>quota</strong> limit</p>',
  },
  body: {
    gfm: 'You are using **448GiB** of disk out of a quota of 500GiB.',
    html: '<p>You are using <strong>448GiB</strong> of disk out of a quota of 500GiB.</p>',
  },
};

describe('UserNotificationDetailView', () => {
  it('renders the created timestamp and the rendered-Markdown summary and body', () => {
    render(<UserNotificationDetailView notification={baseNotification} />);

    // The created timestamp is shown in the reader's local time (matching the
    // component's own formatter so this is timezone-independent).
    expect(
      screen.getByText(formatLocalTimestamp(baseNotification.created))
    ).toBeInTheDocument();

    // The body's `gfm` is rendered as Markdown (the bold word becomes its own
    // element), not shown as raw `**448GiB**` text.
    expect(screen.getByText('448GiB')).toBeInTheDocument();
    expect(screen.queryByText(/\*\*448GiB\*\*/)).not.toBeInTheDocument();

    // The summary's `gfm` is rendered too (bold word is emphasised, not literal).
    expect(screen.getByText('quota')).toBeInTheDocument();
  });

  it('does not render the message id or a "Read" date', () => {
    render(
      <UserNotificationDetailView
        notification={{
          ...baseNotification,
          read: '2026-06-12T18:00:00+00:00',
        }}
      />
    );

    // The redesign drops the metadata card entirely: no id, no "Created"/"Read"
    // labels, and no separate read timestamp.
    expect(screen.queryByText('ntf-001')).not.toBeInTheDocument();
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
    // "Read" survives only as the badge, so there is exactly one occurrence.
    expect(screen.getAllByText('Read')).toHaveLength(1);
  });

  it('exposes the summary as the page-level (h1) heading', () => {
    render(<UserNotificationDetailView notification={baseNotification} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(
      'You are approaching your disk space quota limit'
    );
  });

  it('shows "Unread" when the notification has not been read', () => {
    render(<UserNotificationDetailView notification={baseNotification} />);

    expect(screen.getByText('Unread')).toBeInTheDocument();
  });

  it('flips the badge to "Read" when the notification has been read', () => {
    render(
      <UserNotificationDetailView
        notification={{
          ...baseNotification,
          read: '2026-06-12T18:00:00+00:00',
        }}
      />
    );

    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.queryByText('Unread')).not.toBeInTheDocument();
  });

  it('renders prev/next links with the neighbor summaries and hrefs', () => {
    render(
      <UserNotificationDetailView
        notification={baseNotification}
        prevNotification={{ id: 'ntf-000', summary: 'A newer message' }}
        nextNotification={{ id: 'ntf-002', summary: 'An older message' }}
      />
    );

    const prev = screen.getByRole('link', { name: /Previous/ });
    expect(prev).toHaveAttribute('href', '/notifications/ntf-000');
    expect(prev).toHaveTextContent('A newer message');

    const next = screen.getByRole('link', { name: /Next/ });
    expect(next).toHaveAttribute('href', '/notifications/ntf-002');
    expect(next).toHaveTextContent('An older message');
  });

  it('derives neighbor hrefs from a custom returnHref', () => {
    render(
      <UserNotificationDetailView
        notification={baseNotification}
        returnHref="/inbox"
        nextNotification={{ id: 'ntf-002', summary: 'An older message' }}
      />
    );

    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      '/inbox/ntf-002'
    );
  });

  it('omits prev/next links when there are no neighbors', () => {
    render(<UserNotificationDetailView notification={baseNotification} />);

    expect(
      screen.queryByRole('link', { name: /Previous/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Next/ })
    ).not.toBeInTheDocument();
  });

  it('shows a no-body placeholder when the body is null', () => {
    render(
      <UserNotificationDetailView
        notification={{ ...baseNotification, body: null }}
      />
    );

    expect(
      screen.getByText('This notification has no body.')
    ).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<UserNotificationDetailView isLoading />);

    expect(screen.getByText('Loading notification…')).toBeInTheDocument();
  });

  it('shows a graceful not-found state for a 404 error', () => {
    const error = Object.assign(
      new Error('Semaphore API error: 404 Not Found'),
      { statusCode: 404 }
    );

    render(<UserNotificationDetailView error={error} />);

    expect(screen.getByText('Notification not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to notifications/ })
    ).toHaveAttribute('href', '/notifications');
  });

  it('shows a not-found state when there is neither data nor error', () => {
    render(<UserNotificationDetailView />);

    expect(screen.getByText('Notification not found')).toBeInTheDocument();
  });

  it('shows a generic error state for a non-404 error', () => {
    render(<UserNotificationDetailView error={new Error('Network down')} />);

    expect(screen.getByText('Error loading notification')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to notifications/ })
    ).toBeInTheDocument();
  });

  it('links the back affordance to the notifications inbox by default', () => {
    render(<UserNotificationDetailView notification={baseNotification} />);

    expect(
      screen.getByRole('link', { name: /Back to notifications/ })
    ).toHaveAttribute('href', '/notifications');
  });

  it('points the back link at a custom returnHref', () => {
    render(
      <UserNotificationDetailView
        notification={baseNotification}
        returnHref="/notifications?unread=true"
      />
    );

    expect(
      screen.getByRole('link', { name: /Back to notifications/ })
    ).toHaveAttribute('href', '/notifications?unread=true');
  });
});
