import type { UserNotificationWithUrl } from '@lsst-sqre/semaphore-client';
import { Button, DataTable, type DataTableProps } from '@lsst-sqre/squared';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import RenderedMarkdown from '../RenderedMarkdown';
import styles from './NotificationsTableView.module.css';

/** Where the "Compose" button links by default. */
const DEFAULT_COMPOSE_HREF = '/admin/notifications/new';

export type NotificationsTableViewProps = {
  /** The currently-loaded notifications (server order, most-recent first). */
  notifications: UserNotificationWithUrl[] | undefined;
  /** Whether the initial page is loading. */
  isLoading?: boolean;
  /** Set when the listing failed to load. */
  error?: Error | null;
  /** Whether more pages are available from the server. */
  hasMore?: boolean;
  /** Whether the next page is currently loading. */
  isLoadingMore?: boolean;
  /** Total number of notifications in the (filtered) result set. */
  totalCount?: number | null;
  /** Fetch the next page of older notifications. */
  onLoadMore?: () => void;
  /** Retry the listing query after an error. */
  onRetry?: () => void;
  /** Override the "Compose" button target (defaults to the compose route). */
  composeHref?: string;
};

/**
 * Format an ISO 8601 timestamp as a stable, timezone-independent `YYYY-MM-DD
 * HH:MM UTC` string for the Created column.
 */
function formatCreated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

const columns: DataTableProps<UserNotificationWithUrl>['columns'] = [
  { accessorKey: 'recipient', header: 'Recipient' },
  { accessorKey: 'sender', header: 'Sender' },
  {
    accessorKey: 'created',
    header: 'Created',
    cell: (info) => formatCreated(info.getValue<string>()),
  },
  {
    accessorKey: 'summary',
    header: 'Summary',
    enableSorting: false,
    cell: (info) => (
      <RenderedMarkdown
        className={styles.summary}
        markdown={info.getValue<string>()}
      />
    ),
  },
];

/**
 * Presentational view of the admin notifications listing.
 *
 * Renders a "Compose" button plus the notifications {@link DataTable}
 * (recipient / sender / created / rendered-Markdown summary), a caller-owned
 * "Load more" control, a shown-of-total count, and the loading, empty, and
 * error-with-retry states. It is fully driven by props so it can be exercised
 * from Storybook with fixtures; data fetching lives in the container.
 */
export default function NotificationsTableView({
  notifications,
  isLoading = false,
  error = null,
  hasMore = false,
  isLoadingMore = false,
  totalCount = null,
  onLoadMore,
  onRetry,
  composeHref = DEFAULT_COMPOSE_HREF,
}: NotificationsTableViewProps) {
  const entries = notifications ?? [];
  const shownCount = entries.length;

  let body: React.ReactNode;
  if (isLoading) {
    body = <div className={styles.loadingState}>Loading notifications…</div>;
  } else if (error) {
    body = (
      <div className={styles.errorState}>
        <p>Failed to load notifications</p>
        <p className={styles.errorMessage}>{error.message}</p>
        <Button
          appearance="outline"
          tone="secondary"
          size="sm"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        <DataTable
          columns={columns}
          data={entries}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          aria-label="User notifications"
          emptyContent="No notifications match your filters."
        />
        {shownCount > 0 && (
          <div className={styles.count}>
            Showing {shownCount}
            {totalCount !== null && totalCount !== undefined
              ? ` of ${totalCount}`
              : ''}{' '}
            notifications
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button as={Link} href={composeHref} leadingIcon={PlusCircle} size="sm">
          Compose
        </Button>
      </div>
      {body}
    </div>
  );
}
