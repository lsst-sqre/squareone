'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  fetchUserNotifications,
  type UserNotificationSummary,
  useMarkNotificationsRead,
  useUserNotification,
  useUserNotifications,
} from '@lsst-sqre/semaphore-client';
import { useCallback, useState } from 'react';

import AuthRequired from '../../components/AuthRequired';
import RenderedMarkdown from '../../components/RenderedMarkdown';
import { UserNotificationsTableView } from '../../components/UserNotifications';
import { useAutoMarkNotificationRead } from '../../hooks/useAutoMarkNotificationRead';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useSemaphoreUrlState } from '../../hooks/useSemaphoreUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';

/** Page size owned by the listing container, requested from the list query. */
const PAGE_SIZE = 20;

/**
 * Page size for enumerating the full unread set in "Mark all as read".
 *
 * Larger than the display page size to keep the number of round trips low when
 * walking the cursor-paginated `?unread=true` list to exhaustion.
 */
const MARK_ALL_PAGE_SIZE = 100;

/** Surfaced when service discovery settles but Semaphore is undiscoverable. */
const UNAVAILABLE_ERROR = new Error(
  'The notification service is currently unavailable. Please try again later.'
);

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
 * is `undefined`, which keeps the underlying query disabled and shows the
 * loading state; once discovery settles without a Semaphore URL the table shows
 * a terminal unavailable state instead of an endless spinner (matching the
 * detail page).
 */
export default function NotificationsPageClient() {
  return (
    <AuthRequired>
      <NotificationsContent />
    </AuthRequired>
  );
}

function NotificationsContent() {
  const {
    url: semaphoreUrl,
    isResolving,
    isUnavailable,
  } = useSemaphoreUrlState();
  const repertoireUrl = useRepertoireUrl();
  const { csrfToken } = useLoginInfo(repertoireUrl);
  const { baseUrl } = useStaticConfig();
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

  // The explicit mark-read actions (bulk "Mark read" on a selection and "Mark
  // all as read") route through this one mutation, whose shared `onSuccess`
  // invalidates the list, the unread count, and each affected detail — so the
  // inbox and the header badge update without a manual refresh.
  const { mutate: markRead, mutateAsync: markReadAsync } =
    useMarkNotificationsRead(semaphoreUrl ?? '');

  const handleMarkRead = useCallback(
    (ids: string[]) => {
      if (!semaphoreUrl || !csrfToken || ids.length === 0) {
        return;
      }
      markRead({ ids, csrfToken });
    },
    [semaphoreUrl, csrfToken, markRead]
  );

  // The two-tier "Select all M notifications" path has no standing query for the
  // full unread set, so it enumerates the unread ids on demand by walking the
  // cursor-paginated `?unread=true` list to exhaustion — Semaphore caps a single
  // response at its default page size, so one unpaged request would only cover
  // the first page — and marks exactly that set read. Failures from any page of
  // the enumeration or from the mark-read call reject the returned promise,
  // which the table view awaits so it can keep the selection and surface the
  // error inline (letting the user retry) instead of silently pretending the
  // action worked.
  const handleMarkAllMatchingRead = useCallback(async () => {
    if (!semaphoreUrl || !csrfToken) {
      return;
    }
    const ids: string[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | null = null;
    do {
      const page = await fetchUserNotifications(semaphoreUrl, {
        unread: true,
        limit: MARK_ALL_PAGE_SIZE,
        cursor,
      });
      for (const notification of page.entries) {
        ids.push(notification.id);
      }
      cursor = page.nextCursor;
      // Guard against a server that repeats a cursor: stop rather than loop
      // forever, marking read whatever was enumerated so far.
      if (cursor !== null) {
        if (seenCursors.has(cursor)) {
          break;
        }
        seenCursors.add(cursor);
      }
    } while (cursor !== null);
    if (ids.length > 0) {
      await markReadAsync({ ids, csrfToken });
    }
  }, [semaphoreUrl, csrfToken, markReadAsync]);

  // Discovery has two distinct "no URL yet" outcomes. While it is still
  // resolving the query is disabled, so `isLoading` is `false` even though no
  // data has arrived yet — treat that pending window as loading so the table
  // shows its loading state rather than the misleading empty state. Once
  // discovery settles without a Semaphore URL (Semaphore undiscoverable /
  // unavailable) surface a terminal unavailable error — not an endless spinner —
  // matching the detail page.
  const resolvedError = isUnavailable ? UNAVAILABLE_ERROR : error;

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
        isLoading={isLoading || isResolving}
        error={resolvedError}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalCount={totalCount}
        onLoadMore={loadMore}
        onRetry={refetch}
        showUnreadOnly={showUnreadOnly}
        onShowUnreadOnlyChange={setShowUnreadOnly}
        renderExpandedBody={renderExpandedBody}
        permalinkBase={baseUrl}
        onMarkRead={handleMarkRead}
        onMarkAllMatchingRead={handleMarkAllMatchingRead}
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
