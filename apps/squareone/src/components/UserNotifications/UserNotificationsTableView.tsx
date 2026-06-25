'use client';

import type { UserNotificationSummary } from '@lsst-sqre/semaphore-client';
import {
  Badge,
  Button,
  Checkbox,
  DataTable,
  type DataTableProps,
  DropdownMenu,
} from '@lsst-sqre/squared';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
  /**
   * Render the expand-in-place body for a notification.
   *
   * A `UserNotificationSummary` carries no body, so the container supplies this
   * to fetch and render the full message's body (and to auto-mark it read) only
   * once a row is expanded. When omitted, no expander affordance is shown and
   * each row stays summary-only.
   */
  renderExpandedBody?: (
    notification: UserNotificationSummary
  ) => React.ReactNode;
  /**
   * Mark a set of notifications read.
   *
   * Supplying this opts the table into row selection — a leading checkbox column
   * with a select-all header — plus a bulk-actions {@link DropdownMenu} whose
   * "Mark read" action marks the current selection read. The dropdown is disabled
   * until at least one row is selected, and the selection clears after the action
   * fires. The container owns the mutation and the shared cache invalidation that
   * updates the list and the header unread count. When omitted, no checkbox
   * column or bulk-actions dropdown is shown.
   */
  onMarkRead?: (ids: string[]) => void;
  /**
   * Mark every unread notification read.
   *
   * Supplying this shows a "Mark all as read" button; the container enumerates
   * the unread ids (via `?unread=true`) and marks them read. When omitted, the
   * button is not shown.
   */
  onMarkAllRead?: () => void;
};

// Stable identities so the DataTable's memoized selection column (and its
// checkbox cells) don't rebuild on every render — an inline function here would
// remount the row checkboxes on each selection change.
const getNotificationRowId = (n: UserNotificationSummary) => n.id;
const getNotificationRowLabel = (n: UserNotificationSummary) => n.summary.gfm;

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
 * Markdown summary (the user API's `gfm` field, no column header). When a
 * `renderExpandedBody` renderer is supplied, the secondary row also carries an
 * expander control that reveals the message body in place beneath the summary;
 * the view owns the expanded/collapsed state, while fetching the body and
 * auto-marking it read live in that container-supplied renderer. When an
 * `onMarkRead` handler is supplied, the table also gains row selection (a
 * leading checkbox column with select-all) and a bulk-actions dropdown whose
 * "Mark read" action — enabled once at least one row is selected — marks the
 * selection read; an `onMarkAllRead` handler adds a "Mark all as read" button.
 * The view owns the selection state but routes the actual marking back to the
 * container. The view also owns a "Load more" control, a shown-of-total count,
 * and the loading, empty, and error-with-retry states. It is fully driven by
 * props so it can be exercised from Storybook with fixtures; data fetching lives
 * in the container.
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
  renderExpandedBody,
  onMarkRead,
  onMarkAllRead,
}: UserNotificationsTableViewProps) {
  const entries = notifications ?? [];
  const shownCount = entries.length;

  // Row selection drives the bulk-actions dropdown; it's enabled only when the
  // container supplies a mark-read handler. The selection map is keyed by
  // notification id (via the table's `getRowId`), so it maps straight back to
  // ids and a stale id from a row that left the list is harmless.
  const selectionEnabled = onMarkRead !== undefined;
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    () => ({})
  );
  const selectedIds = entries
    .filter((n) => rowSelection[n.id])
    .map((n) => n.id);

  const markReadSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }
    onMarkRead?.(selectedIds);
    // Clear the selection: the marked rows are done, and (under "Show unread
    // only") they leave the list on the next refetch, so a lingering selection
    // would be meaningless.
    setRowSelection({});
  };

  const hasBulkControls = selectionEnabled || onMarkAllRead !== undefined;

  // Which rows are currently expanded to show their body. Purely presentational
  // interaction state; the body content itself comes from `renderExpandedBody`.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

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
          getRowId={getNotificationRowId}
          getRowLabel={getNotificationRowLabel}
          rowSelection={selectionEnabled ? rowSelection : undefined}
          onRowSelectionChange={selectionEnabled ? setRowSelection : undefined}
          aria-label="Notifications"
          emptyContent={
            showUnreadOnly
              ? 'You have no unread notifications.'
              : 'You have no notifications.'
          }
          renderDetailRow={(n) => {
            const expanded = expandedIds.has(n.id);
            return (
              <div className={styles.detail}>
                <div className={styles.summaryRow}>
                  {renderExpandedBody && (
                    <button
                      type="button"
                      className={styles.expandButton}
                      aria-expanded={expanded}
                      aria-label={
                        expanded ? 'Hide message body' : 'Show message body'
                      }
                      onClick={() => toggleExpanded(n.id)}
                    >
                      {expanded ? (
                        <ChevronDown size={16} aria-hidden="true" />
                      ) : (
                        <ChevronRight size={16} aria-hidden="true" />
                      )}
                    </button>
                  )}
                  <RenderedMarkdown
                    className={styles.summary}
                    markdown={n.summary.gfm}
                  />
                </div>
                {renderExpandedBody && expanded && (
                  <div className={styles.body}>{renderExpandedBody(n)}</div>
                )}
              </div>
            );
          }}
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
        {hasBulkControls && (
          <div className={styles.bulkActions}>
            {selectionEnabled && (
              <DropdownMenu>
                <DropdownMenu.Trigger disabled={selectedIds.length === 0}>
                  Bulk actions
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={markReadSelected}>
                    Mark read
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
            {onMarkAllRead && (
              <Button
                appearance="outline"
                tone="secondary"
                size="sm"
                onClick={onMarkAllRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        )}
        <div className={styles.filter}>
          <Checkbox
            label="Show unread only"
            checked={showUnreadOnly}
            onCheckedChange={(checked) =>
              onShowUnreadOnlyChange?.(checked === true)
            }
          />
        </div>
      </div>
      {body}
    </div>
  );
}
