'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  useUserNotification,
  useUserNotifications,
} from '@lsst-sqre/semaphore-client';

import AuthRequired from '../../../components/AuthRequired';
import { UserNotificationDetailView } from '../../../components/UserNotifications';
import { useAutoMarkNotificationRead } from '../../../hooks/useAutoMarkNotificationRead';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import { useSemaphoreUrlState } from '../../../hooks/useSemaphoreUrl';

export type NotificationDetailPageClientProps = {
  /** Opaque notification id from the `[id]` route segment. */
  id: string;
};

/** Surfaced when service discovery settles but Semaphore is undiscoverable. */
const UNAVAILABLE_ERROR = new Error(
  'The notification service is currently unavailable. Please try again later.'
);

/**
 * Client container for the `/notifications/[id]` detail page.
 *
 * Wrapped in {@link AuthRequired} (login only, no admin scope) so logged-out
 * users are redirected to log in. It resolves the Semaphore base URL via
 * Repertoire discovery and fetches the single notification with
 * {@link useUserNotification}, handing the result to the presentational
 * {@link UserNotificationDetailView}. Fetching does not auto-mark the
 * notification read — that is a later slice.
 *
 * Discovery has two distinct "no URL yet" outcomes. While it is still resolving
 * the query is disabled and we show a loading state. Once it has settled without
 * a Semaphore URL (Semaphore undiscoverable / unavailable) we render a terminal
 * unavailable state — not an endless spinner, and not a misleading not-found.
 *
 * Viewing the detail page auto-marks the notification read (via
 * {@link useAutoMarkNotificationRead}) once it loads unread, so the inbox row
 * status and the header unread badge update without a manual refresh.
 *
 * It also fetches the inbox list to derive prev/next neighbors for the view's
 * footer navigation (the Semaphore API exposes no neighbor endpoint), degrading
 * gracefully when the list is still loading or the id falls outside the loaded
 * page.
 */
export default function NotificationDetailPageClient({
  id,
}: NotificationDetailPageClientProps) {
  return (
    <AuthRequired>
      <NotificationDetailContent id={id} />
    </AuthRequired>
  );
}

function NotificationDetailContent({ id }: { id: string }) {
  const { url, isResolving, isUnavailable } = useSemaphoreUrlState();
  const repertoireUrl = useRepertoireUrl();
  const { csrfToken } = useLoginInfo(repertoireUrl);
  const { notification, isLoading, isError, error } = useUserNotification(
    url ?? '',
    id
  );

  // Derive prev/next neighbors from the inbox list so the detail page can offer
  // navigation the Semaphore API has no endpoint for. The list is unfiltered
  // (no `unread`) so neighbors stay stable regardless of the inbox's filter
  // state, and `entries` is already newest-first server order (no client sort).
  // Convention: Previous = newer (up the list), Next = older (down the list).
  // Neighbors are absent while the list loads, when the id isn't in this page,
  // or at the list's ends — the view simply omits the missing link. Known
  // limitation: only the first `limit` page is searched, so an id beyond that
  // window shows no neighbors (fine for typical inboxes; a follow-up could
  // auto-`loadMore` until the id is found).
  const { entries } = useUserNotifications(url ?? '', { limit: 100 });
  const i = entries?.findIndex((n) => n.id === id) ?? -1;
  const prev = entries && i > 0 ? entries[i - 1] : undefined;
  const next =
    entries && i >= 0 && i < entries.length - 1 ? entries[i + 1] : undefined;
  const prevNotification = prev
    ? { id: prev.id, summary: prev.summary.gfm }
    : undefined;
  const nextNotification = next
    ? { id: next.id, summary: next.summary.gfm }
    : undefined;

  useAutoMarkNotificationRead({
    semaphoreUrl: url,
    csrfToken,
    id,
    // Gate on the fetched record so a mark only fires once the body is shown,
    // and never for an already-read notification.
    isUnread: notification?.read === null,
  });

  const resolvedError = isUnavailable
    ? UNAVAILABLE_ERROR
    : isError
      ? error
      : null;

  return (
    <UserNotificationDetailView
      notification={notification}
      isLoading={isLoading || isResolving}
      error={resolvedError}
      prevNotification={prevNotification}
      nextNotification={nextNotification}
    />
  );
}
