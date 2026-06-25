'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  type UserNotificationSummary,
  useUserNotification,
  useUserNotifications,
} from '@lsst-sqre/semaphore-client';
import { useCallback, useState } from 'react';

import AuthRequired from '../../components/AuthRequired';
import RenderedMarkdown from '../../components/RenderedMarkdown';
import { UserNotificationsTableView } from '../../components/UserNotifications';
import { useAutoMarkNotificationRead } from '../../hooks/useAutoMarkNotificationRead';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useSemaphoreUrl } from '../../hooks/useSemaphoreUrl';

/** Page size owned by the listing container, requested from the list query. */
const PAGE_SIZE = 20;

/**
 * Client container for the `/notifications` inbox page.
 *
 * Resolves the Semaphore base URL from service discovery and fetches the
 * authenticated user's notifications with cursor-based "Load more" pagination.
 * The presentational work — the table, the "Show unread only" toggle, the
 * expand-in-place affordance, and the loading/empty/error states — lives in
 * {@link UserNotificationsTableView}; this component wires data, the toggle
 * state, and the expand-in-place body together.
 *
 * Wrapped in {@link AuthRequired} (login only, no admin scope) so logged-out
 * users are redirected to log in. While discovery is pending the Semaphore URL
 * is `undefined`, which keeps the underlying query disabled (graceful
 * degradation, as the admin listing already does).
 */
export default function NotificationsPageClient() {
  return (
    <AuthRequired>
      <NotificationsContent />
    </AuthRequired>
  );
}

function NotificationsContent() {
  const semaphoreUrl = useSemaphoreUrl();
  const repertoireUrl = useRepertoireUrl();
  const { csrfToken } = useLoginInfo(repertoireUrl);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    entries,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    totalCount,
    loadMore,
    refetch,
  } = useUserNotifications(semaphoreUrl ?? '', {
    unread: showUnreadOnly,
    limit: PAGE_SIZE,
  });

  // While service discovery is pending the Semaphore URL is `undefined`, which
  // keeps the underlying query disabled, so `isLoading` is `false` even though
  // no data has arrived yet. Treat that pending window as loading so the table
  // shows its loading state rather than the misleading empty state.
  const isDiscovering = semaphoreUrl === undefined;

  // A `UserNotificationSummary` has no body, so expand-in-place renders a small
  // child that fetches the full notification (for its body) and auto-marks it
  // read once shown. Memoized on the inputs it closes over so the table's
  // detail rows have a stable renderer identity.
  const renderExpandedBody = useCallback(
    (notification: UserNotificationSummary) => (
      <ExpandedNotificationBody
        id={notification.id}
        semaphoreUrl={semaphoreUrl}
        csrfToken={csrfToken}
      />
    ),
    [semaphoreUrl, csrfToken]
  );

  return (
    <div>
      <h1>Notifications</h1>
      <p>
        Messages sent to you about your Rubin Science Platform account and
        services, most recent first.
      </p>

      <UserNotificationsTableView
        notifications={entries}
        isLoading={isLoading || isDiscovering}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalCount={totalCount}
        onLoadMore={loadMore}
        onRetry={refetch}
        showUnreadOnly={showUnreadOnly}
        onShowUnreadOnlyChange={setShowUnreadOnly}
        renderExpandedBody={renderExpandedBody}
      />
    </div>
  );
}

type ExpandedNotificationBodyProps = {
  /** The notification id to fetch and render the body for. */
  id: string;
  /** Base URL of the Semaphore service, or `undefined` before discovery. */
  semaphoreUrl: string | undefined;
  /** CSRF token from Gafaelfawr login info, used to mark the message read. */
  csrfToken: string | null | undefined;
};

/**
 * The expand-in-place body for one inbox row.
 *
 * The list endpoint omits the body, so this fetches the full notification with
 * {@link useUserNotification} when a row is expanded, renders the `gfm` body, and
 * auto-marks the message read via {@link useAutoMarkNotificationRead} once it is
 * shown (and only if it is unread). It renders nothing destructive while loading
 * or on error — just an inline status line — so a transient failure never blanks
 * the row.
 */
function ExpandedNotificationBody({
  id,
  semaphoreUrl,
  csrfToken,
}: ExpandedNotificationBodyProps) {
  const { notification, isLoading, error } = useUserNotification(
    semaphoreUrl ?? '',
    id
  );

  useAutoMarkNotificationRead({
    semaphoreUrl,
    csrfToken,
    id,
    // Gate on the fetched record's read state so a mark only fires once the body
    // is actually shown, and never for an already-read message.
    isUnread: notification?.read === null,
  });

  if (isLoading) {
    return <p>Loading message…</p>;
  }
  if (error || !notification) {
    return <p>Unable to load this message.</p>;
  }

  const { body } = notification;
  const hasBody = !!body && body.gfm.trim() !== '';
  return hasBody ? (
    <RenderedMarkdown markdown={body.gfm} />
  ) : (
    <p>This notification has no body.</p>
  );
}
