'use client';

import { useUserNotifications } from '@lsst-sqre/semaphore-client';
import { useState } from 'react';

import AuthRequired from '../../components/AuthRequired';
import { UserNotificationsTableView } from '../../components/UserNotifications';
import { useSemaphoreUrl } from '../../hooks/useSemaphoreUrl';

/** Page size owned by the listing container, requested from the list query. */
const PAGE_SIZE = 20;

/**
 * Client container for the `/notifications` inbox page.
 *
 * Resolves the Semaphore base URL from service discovery and fetches the
 * authenticated user's notifications with cursor-based "Load more" pagination.
 * The presentational work — the table, the "Show unread only" toggle, and the
 * loading/empty/error states — lives in {@link UserNotificationsTableView}; this
 * component only wires data and the toggle state together.
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
      />
    </div>
  );
}
