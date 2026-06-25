'use client';

import { useUserNotification } from '@lsst-sqre/semaphore-client';

import AuthRequired from '../../../components/AuthRequired';
import { UserNotificationDetailView } from '../../../components/UserNotifications';
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
  const { notification, isLoading, isError, error } = useUserNotification(
    url ?? '',
    id
  );

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
    />
  );
}
