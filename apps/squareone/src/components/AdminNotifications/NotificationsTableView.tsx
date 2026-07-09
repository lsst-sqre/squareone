import type { UserNotificationWithUrl } from '@lsst-sqre/semaphore-client';
import {
  Button,
  DataTable,
  type DataTableProps,
  ErrorMessage,
} from '@lsst-sqre/squared';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { formatUtcTimestamp } from '../../lib/utils/dateFormatters';
import RenderedMarkdown from '../RenderedMarkdown';
import styles from './NotificationsTableView.module.css';

/** Base path for the admin notifications routes. */
const NOTIFICATIONS_BASE_HREF = '/admin/notifications';

/** Where the "Compose" button links by default. */
const DEFAULT_COMPOSE_HREF = `${NOTIFICATIONS_BASE_HREF}/new`;

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

const columns: DataTableProps<UserNotificationWithUrl>['columns'] = [
  { accessorKey: 'recipient', header: 'Recipient' },
  { accessorKey: 'sender', header: 'Sender' },
  {
    accessorKey: 'created',
    header: 'Created',
    cell: (info) => formatUtcTimestamp(info.getValue<string>()),
  },
];

/**
 * Presentational view of the admin notifications listing.
 *
 * Renders a "Compose" button plus the notifications {@link DataTable}. Each
 * notification is a two-row unit: a primary row with the sortable recipient,
 * sender, and created columns, and a full-width secondary row beneath it
 * holding the rendered-Markdown summary (no column header). The view also
 * owns a "Load more" control, a shown-of-total count, and the loading, empty,
 * and error-with-retry states. It is fully driven by props so it can be
 * exercised from Storybook with fixtures; data fetching lives in the container.
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
        <ErrorMessage
          strategy="dynamic"
          message="Failed to load notifications"
        />
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
          renderDetailRow={(n) => (
            <Link
              href={`${NOTIFICATIONS_BASE_HREF}/${n.id}`}
              className={styles.summaryLink}
            >
              <RenderedMarkdown
                className={styles.summary}
                markdown={n.summary}
              />
            </Link>
          )}
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
