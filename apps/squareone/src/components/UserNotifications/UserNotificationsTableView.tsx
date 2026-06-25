import type { UserNotificationSummary } from '@lsst-sqre/semaphore-client';
import {
  Badge,
  Button,
  Checkbox,
  DataTable,
  type DataTableProps,
} from '@lsst-sqre/squared';

import { formatUtcTimestamp } from '../../lib/utils/dateFormatters';
import RenderedMarkdown from '../RenderedMarkdown';
import styles from './UserNotificationsTableView.module.css';

export type UserNotificationsTableViewProps = {
  /** The currently-loaded notifications (server order, most-recent first). */
  notifications: UserNotificationSummary[] | undefined;
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
  /** Whether the list is filtered to unread notifications only. */
  showUnreadOnly?: boolean;
  /** Toggle the "Show unread only" filter. */
  onShowUnreadOnlyChange?: (showUnreadOnly: boolean) => void;
};

const columns: DataTableProps<UserNotificationSummary>['columns'] = [
  {
    accessorKey: 'created',
    header: 'Date',
    cell: (info) => formatUtcTimestamp(info.getValue<string>()),
  },
  {
    accessorKey: 'read',
    header: 'Status',
    cell: (info) =>
      info.getValue<string | null>() ? (
        <Badge color="gray" variant="soft">
          Read
        </Badge>
      ) : (
        <Badge color="blue" variant="solid">
          Unread
        </Badge>
      ),
  },
];

/**
 * Presentational view of the user's notifications listing.
 *
 * Renders a "Show unread only" toggle plus the notifications {@link DataTable}.
 * Each notification is a two-row unit: a primary row with its date and read
 * status, and a full-width secondary row beneath it holding the rendered-
 * Markdown summary (the user API's `gfm` field, no column header). The view also
 * owns a "Load more" control, a shown-of-total count, and the loading, empty,
 * and error-with-retry states. It is fully driven by props so it can be
 * exercised from Storybook with fixtures; data fetching lives in the container.
 *
 * Read-only in this slice: there is no row selection, mark-read, or per-message
 * detail navigation yet.
 */
export default function UserNotificationsTableView({
  notifications,
  isLoading = false,
  error = null,
  hasMore = false,
  isLoadingMore = false,
  totalCount = null,
  onLoadMore,
  onRetry,
  showUnreadOnly = false,
  onShowUnreadOnlyChange,
}: UserNotificationsTableViewProps) {
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
          aria-label="Notifications"
          emptyContent={
            showUnreadOnly
              ? 'You have no unread notifications.'
              : 'You have no notifications.'
          }
          renderDetailRow={(n) => (
            <RenderedMarkdown
              className={styles.summary}
              markdown={n.summary.gfm}
            />
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
        <Checkbox
          label="Show unread only"
          checked={showUnreadOnly}
          onCheckedChange={(checked) =>
            onShowUnreadOnlyChange?.(checked === true)
          }
        />
      </div>
      {body}
    </div>
  );
}
