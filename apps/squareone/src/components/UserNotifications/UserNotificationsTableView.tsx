'use client';

import type { UserNotificationSummary } from '@lsst-sqre/semaphore-client';
import {
  Button,
  Checkbox,
  copyToClipboard,
  DropdownMenu,
  ErrorMessage,
  Note,
} from '@lsst-sqre/squared';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  formatRelativeToNow,
  formatUtcTimestamp,
} from '../../lib/utils/dateFormatters';
import { markdownToPlainText, renderInlineMarkdown } from '../RenderedMarkdown';
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
   * once a row is expanded. When omitted, the chevron+summary toggle is not
   * shown and each row's summary stays a plain, non-interactive line.
   */
  renderExpandedBody?: (
    notification: UserNotificationSummary
  ) => React.ReactNode;
  /**
   * Absolute origin used to build each row's "Copy link" permalink.
   *
   * The per-row "…" menu copies `${permalinkBase}/notifications/{id}` so the
   * link resolves to the standalone detail page from anywhere. Defaults to `''`,
   * in which case a relative `/notifications/{id}` path is copied instead (still
   * navigable in-app, and convenient for Storybook where no config is present).
   */
  permalinkBase?: string;
  /**
   * Mark a set of notifications read.
   *
   * Supplying this opts the inbox into row selection — a leading checkbox per
   * row plus a "Select all" toolbar checkbox — and an "Actions" dropdown (shown
   * once at least one row is selected) whose "Mark as read" action marks the
   * unread members of the selection read. The same handler also backs each row's
   * per-row "Mark as read" menu item. The container owns the mutation and the
   * shared cache invalidation that updates the list and the header unread count.
   * When omitted, no selection chrome or per-row mark-read action is shown.
   */
  onMarkRead?: (ids: string[]) => void;
  /**
   * Mark the entire filtered result set read, including pages not yet loaded.
   *
   * Backs the two-tier "Select all M notifications" extension: once every loaded
   * row is selected and more pages exist, the user can extend the selection to
   * the full filtered set, which the view cannot enumerate. Choosing "Mark as
   * read" in that state calls this so the container can enumerate the unread ids
   * (via `?unread=true`) and mark them read. The view awaits the returned
   * promise: on success it clears the selection, and on rejection it keeps the
   * selection and shows an inline error so the user can retry. When omitted, the
   * extension banner still appears but its bulk mark-read is a no-op for the
   * unloaded remainder.
   */
  onMarkAllMatchingRead?: () => void | Promise<void>;
};

type NotificationRowProps = {
  notification: UserNotificationSummary;
  /** Whether this row's selection checkbox is checked. */
  selected: boolean;
  /** Toggle this row's selection. */
  onSelectedChange: (selected: boolean) => void;
  /** Whether this row is expanded to show its body. */
  expanded: boolean;
  /** Toggle this row's expanded state. */
  onToggleExpanded: () => void;
  /** Render the expand-in-place body; when omitted the summary is plain text. */
  renderExpandedBody?: (
    notification: UserNotificationSummary
  ) => React.ReactNode;
  /** Absolute origin for the copy-link permalink (or `''` for a relative path). */
  permalinkBase: string;
  /** Mark this single notification read; enables the per-row "Mark as read". */
  onMarkRead?: (ids: string[]) => void;
  /** Whether the leading selection checkbox is shown. */
  selectionEnabled: boolean;
};

/**
 * One inbox row: unread dot · selection checkbox · summary (a toggle that
 * expands the body in place) · relative date · always-visible "…" menu.
 *
 * The interactive controls are sibling grid cells, never nested, so the row
 * stays valid, keyboard-accessible HTML. Unread state is conveyed visually by
 * the dot (decorative) and to assistive tech by the toggle's accessible label.
 */
function NotificationRow({
  notification,
  selected,
  onSelectedChange,
  expanded,
  onToggleExpanded,
  renderExpandedBody,
  permalinkBase,
  onMarkRead,
  selectionEnabled,
}: NotificationRowProps) {
  const isUnread = notification.read === null;
  // Render the summary from its Markdown (`gfm`) through the shared sanitizing
  // pipeline rather than injecting the API's pre-rendered `summary.html`:
  // `renderInlineMarkdown` strips dangerous HTML, flattens links, and drops the
  // block wrapper so the result is valid phrasing content for the toggle button.
  const inlineSummaryHtml = useMemo(
    () => renderInlineMarkdown(notification.summary.gfm),
    [notification.summary.gfm]
  );
  const plainSummary = useMemo(
    () => markdownToPlainText(notification.summary.gfm),
    [notification.summary.gfm]
  );

  const relativeDate = formatRelativeToNow(notification.created);
  const absoluteDate = formatUtcTimestamp(notification.created);

  let permalinkUrl = `/notifications/${notification.id}`;
  if (permalinkBase) {
    try {
      permalinkUrl = new URL(permalinkUrl, permalinkBase).toString();
    } catch {
      // Keep the relative fallback when permalinkBase is not a valid origin.
    }
  }

  const handleCopyLink = () => {
    copyToClipboard(permalinkUrl);
  };

  return (
    <li className={`${styles.row} ${isUnread ? styles.unread : ''}`}>
      {isUnread ? (
        <span className={styles.unreadDot} aria-hidden="true" />
      ) : (
        <span className={styles.readDot} aria-hidden="true" />
      )}

      <span className={styles.checkboxCell}>
        {selectionEnabled && (
          <Checkbox
            aria-label={`Select notification: ${plainSummary}`}
            checked={selected}
            onCheckedChange={(checked) => onSelectedChange(checked === true)}
          />
        )}
      </span>

      {renderExpandedBody ? (
        <button
          type="button"
          className={styles.summaryToggle}
          aria-expanded={expanded}
          aria-label={`${isUnread ? 'Unread. ' : ''}${
            expanded ? 'Hide' : 'Show'
          } message: ${plainSummary}`}
          onClick={onToggleExpanded}
        >
          {/* Chevron size comes from --sqo-notification-expander-size in the
           * module CSS, so no size prop here. */}
          {expanded ? (
            <ChevronDown aria-hidden="true" />
          ) : (
            <ChevronRight aria-hidden="true" />
          )}
          {/* Sanitized, link-flattened inline HTML (see renderInlineMarkdown). */}
          <span
            className={styles.summaryText}
            dangerouslySetInnerHTML={{ __html: inlineSummaryHtml }}
          />
        </button>
      ) : (
        <span
          className={styles.summaryText}
          dangerouslySetInnerHTML={{ __html: inlineSummaryHtml }}
        />
      )}

      <time
        className={styles.date}
        dateTime={notification.created}
        title={absoluteDate}
      >
        {relativeDate}
      </time>

      <DropdownMenu>
        <DropdownMenu.Trigger asChild showChevron={false}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Notification actions"
          >
            <MoreHorizontal size={16} aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {isUnread && onMarkRead && (
            <DropdownMenu.Item onSelect={() => onMarkRead([notification.id])}>
              Mark as read
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item onSelect={handleCopyLink}>
            Copy link
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      {renderExpandedBody && expanded && (
        <div className={styles.expandedBody}>
          {renderExpandedBody(notification)}
        </div>
      )}
    </li>
  );
}

/**
 * Presentational view of the user's notifications inbox.
 *
 * Renders a GitHub-style flat list of full-width rows — unread dot, selection
 * checkbox, a summary that expands its body inline, a relative date, and a
 * per-row "…" menu (Mark as read / Copy link) — beneath a toolbar carrying a
 * "Select all" checkbox, a selection-driven "Actions" dropdown, and the "Show
 * unread only" filter. Selection is two-tier: "Select all" selects the loaded
 * rows, and when more pages exist a banner offers to extend the selection to the
 * whole filtered set. The view owns the expanded/collapsed and selection state
 * but routes the actual marking back to the container (which owns the mutation
 * and cache invalidation). It also owns the "Load more" control, a shown-of-total
 * count, and the loading, empty, and error-with-retry states. It is fully driven
 * by props so it can be exercised from Storybook with fixtures; data fetching
 * lives in the container.
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
  permalinkBase = '',
  onMarkRead,
  onMarkAllMatchingRead,
}: UserNotificationsTableViewProps) {
  const entries = notifications ?? [];
  const shownCount = entries.length;

  // Selection chrome is enabled only when the container supplies a mark-read
  // handler. The selection map is keyed by notification id, so it maps straight
  // back to ids and a stale id from a row that left the list is harmless.
  const selectionEnabled = onMarkRead !== undefined;
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    () => ({})
  );
  // Two-tier extension flag: the user selected every loaded row and then opted
  // to extend the selection to the full filtered set (pages not yet loaded).
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  // Set when the across-pages bulk mark-read fails. The selection is kept in
  // that case so the user can retry; the error is shown inline above the list.
  const [bulkMarkReadError, setBulkMarkReadError] = useState<Error | null>(
    null
  );

  // Which rows are expanded to show their body. Purely presentational; the body
  // content itself comes from `renderExpandedBody`.
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

  // A stale "all M" selection would target the wrong set after the filter flips.
  // The filter only changes via the toggle below, which clears the selection as
  // it fires, so there is no separate effect to keep them in sync.
  const clearSelection = () => {
    setRowSelection({});
    setAllMatchingSelected(false);
    // A bulk mark-read error describes the selection it failed for, so it is
    // dismissed along with that selection.
    setBulkMarkReadError(null);
  };

  // While the "all matching" extension is active every loaded row is selected
  // by definition — including rows appended by "Load more" after the extension
  // was chosen — so derive per-row checked state from the flag, not just the
  // concrete selection map.
  const isRowSelected = (id: string) =>
    allMatchingSelected || rowSelection[id] === true;
  const loadedSelectedIds = entries
    .filter((n) => isRowSelected(n.id))
    .map((n) => n.id);
  const allLoadedSelected =
    entries.length > 0 && loadedSelectedIds.length === entries.length;
  const headerChecked: boolean | 'indeterminate' = allLoadedSelected
    ? true
    : loadedSelectedIds.length > 0
      ? 'indeterminate'
      : false;
  const hasSelection = loadedSelectedIds.length > 0 || allMatchingSelected;
  const selectedCount =
    allMatchingSelected && totalCount != null
      ? totalCount
      : loadedSelectedIds.length;
  const showSelectAllBanner =
    selectionEnabled && allLoadedSelected && hasMore && !allMatchingSelected;

  const handleHeaderToggle = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const next: Record<string, boolean> = {};
      for (const n of entries) {
        next[n.id] = true;
      }
      setRowSelection(next);
    } else {
      clearSelection();
    }
  };

  const handleRowSelectedChange = (id: string, checked: boolean) => {
    if (allMatchingSelected) {
      // Any manual change to row selection cancels the "all matching"
      // extension: the user is now curating a concrete selection, so fall back
      // to the loaded rows (all selected under the extension) with this row's
      // new state applied. Otherwise "Mark as read" would still act on the
      // whole filtered set — including the row just visibly deselected.
      const next: Record<string, boolean> = {};
      for (const n of entries) {
        next[n.id] = true;
      }
      next[id] = checked;
      setAllMatchingSelected(false);
      setRowSelection(next);
    } else {
      setRowSelection((prev) => ({ ...prev, [id]: checked }));
    }
  };

  const handleBulkMarkRead = async () => {
    if (allMatchingSelected) {
      // The view cannot enumerate the unloaded ids; the container marks the
      // whole filtered set read via its `?unread=true` enumeration. Await it so
      // a failure keeps the selection (letting the user retry) and surfaces an
      // inline error instead of clearing the selection as if the action worked.
      setBulkMarkReadError(null);
      try {
        await onMarkAllMatchingRead?.();
      } catch (error) {
        setBulkMarkReadError(
          error instanceof Error ? error : new Error(String(error))
        );
        return;
      }
    } else {
      const ids = entries
        .filter((n) => rowSelection[n.id] && n.read === null)
        .map((n) => n.id);
      if (ids.length > 0) {
        onMarkRead?.(ids);
      }
    }
    clearSelection();
  };

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
  } else if (entries.length === 0) {
    body = (
      <div className={styles.emptyState}>
        {showUnreadOnly
          ? 'You have no unread notifications.'
          : 'You have no notifications.'}
      </div>
    );
  } else {
    body = (
      <>
        <ul className={styles.list} aria-label="Notifications">
          {entries.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              selected={isRowSelected(n.id)}
              onSelectedChange={(checked) =>
                handleRowSelectedChange(n.id, checked)
              }
              expanded={expandedIds.has(n.id)}
              onToggleExpanded={() => toggleExpanded(n.id)}
              renderExpandedBody={renderExpandedBody}
              permalinkBase={permalinkBase}
              onMarkRead={onMarkRead}
              selectionEnabled={selectionEnabled}
            />
          ))}
        </ul>
        {hasMore && onLoadMore && (
          <div className={styles.loadMore}>
            <Button
              appearance="outline"
              tone="secondary"
              size="sm"
              onClick={onLoadMore}
              loading={isLoadingMore}
            >
              Load more
            </Button>
          </div>
        )}
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
        {selectionEnabled && (
          <div className={styles.selectionControls}>
            <Checkbox
              label="Select all"
              checked={headerChecked}
              onCheckedChange={handleHeaderToggle}
            />
            {hasSelection && (
              <>
                <span className={styles.selectedCount} aria-live="polite">
                  {selectedCount} selected
                </span>
                <DropdownMenu>
                  <DropdownMenu.Trigger className={styles.actionsTrigger}>
                    Actions
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={handleBulkMarkRead}>
                      Mark as read
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </>
            )}
          </div>
        )}
        <div className={styles.filter}>
          <Checkbox
            label="Show unread only"
            checked={showUnreadOnly}
            onCheckedChange={(checked) => {
              // A stale "all M" selection would target the pre-filter set.
              clearSelection();
              onShowUnreadOnlyChange?.(checked === true);
            }}
          />
        </div>
      </div>

      {selectionEnabled && (showSelectAllBanner || allMatchingSelected) && (
        <Note type="info">
          <div className={styles.selectAllBanner}>
            {allMatchingSelected ? (
              <>
                <span>
                  All {totalCount ?? loadedSelectedIds.length} selected.
                </span>
                <button
                  type="button"
                  className={styles.bannerButton}
                  onClick={clearSelection}
                >
                  Clear selection
                </button>
              </>
            ) : (
              <>
                <span>All {shownCount} on this page selected.</span>
                <button
                  type="button"
                  className={styles.bannerButton}
                  onClick={() => setAllMatchingSelected(true)}
                >
                  Select all {totalCount ?? shownCount} notifications
                </button>
              </>
            )}
          </div>
        </Note>
      )}

      {bulkMarkReadError && (
        <ErrorMessage
          className={styles.bulkMarkReadError}
          strategy="dynamic"
          role="alert"
          message={`Failed to mark notifications as read: ${bulkMarkReadError.message}`}
        />
      )}

      {body}
    </div>
  );
}
