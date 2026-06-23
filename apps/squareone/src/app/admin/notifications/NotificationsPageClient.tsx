'use client';

import type { AdminNotificationFilters } from '@lsst-sqre/semaphore-client';
import { useAdminNotifications } from '@lsst-sqre/semaphore-client';

import {
  NotificationFilters,
  NotificationsTableView,
} from '../../../components/AdminNotifications';
import useAdminNotificationFilters from '../../../hooks/useAdminNotificationFilters';
import { useSemaphoreUrl } from '../../../hooks/useSemaphoreUrl';

/**
 * Client container for the `/admin/notifications` listing page.
 *
 * Resolves the Semaphore base URL from service discovery, reads the
 * URL-captured filters, and fetches the notifications with cursor-based
 * "Load more" pagination. The presentational work — the filter bar and the
 * table with its loading/empty/error states — lives in
 * {@link NotificationFilters} and {@link NotificationsTableView}; this
 * component only wires data and callbacks together.
 *
 * The page sits behind the `exec:admin` gate inherited from the admin layout.
 * While discovery is pending the Semaphore URL is `undefined`, which keeps the
 * underlying query disabled (graceful degradation, as broadcasts already do).
 */
export default function NotificationsPageClient() {
  const semaphoreUrl = useSemaphoreUrl();
  const { filters, setFilter, clearAllFilters } = useAdminNotificationFilters();

  const {
    entries,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    totalCount,
    loadMore,
    refetch,
  } = useAdminNotifications(semaphoreUrl ?? '', filters);

  // While service discovery is pending the Semaphore URL is `undefined`, which
  // keeps the underlying query disabled, so `isLoading` is `false` even though
  // no data has arrived yet. Treat that pending window as loading so the table
  // shows its loading state rather than the misleading "no matches" empty state.
  const isDiscovering = semaphoreUrl === undefined;

  // Each handler emitted by `NotificationFilters` carries exactly one key, so
  // applying them one at a time is safe. If a future caller batches multiple
  // keys into a single `partial`, route them through one URLSearchParams update
  // instead: `setFilter` snapshots `searchParams`, so per-key calls here would
  // clobber each other and only the last key would survive.
  const handleFilterChange = (partial: Partial<AdminNotificationFilters>) => {
    for (const [key, value] of Object.entries(partial)) {
      setFilter(
        key as 'recipient' | 'sender' | 'since' | 'until',
        value as string | Date | undefined
      );
    }
  };

  return (
    <div>
      <h1>User notifications</h1>
      <p>
        Recent notifications sent to Rubin Science Platform users, most recent
        first. Filter by recipient, sender, or date range, or compose a new
        notification.
      </p>

      <NotificationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
      />

      <NotificationsTableView
        notifications={entries}
        isLoading={isLoading || isDiscovering}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalCount={totalCount}
        onLoadMore={loadMore}
        onRetry={refetch}
      />
    </div>
  );
}
