'use client';

import { useAdminNotification } from '@lsst-sqre/semaphore-client';

import NotificationDetailView from '@/components/NotificationDetailView';
import { useSemaphoreUrlState } from '@/hooks/useSemaphoreUrl';

export type NotificationDetailPageClientProps = {
  /** Opaque notification id from the `[id]` route segment. */
  id: string;
};

/** Surfaced when service discovery settles but Semaphore is undiscoverable. */
const UNAVAILABLE_ERROR = new Error(
  'The notification service is currently unavailable. Please try again later.'
);

/**
 * Client container for the `/admin/notifications/[id]` detail page.
 *
 * Resolves the Semaphore base URL via Repertoire discovery and fetches the
 * single notification with {@link useAdminNotification}, handing the result to
 * the presentational {@link NotificationDetailView}.
 *
 * Discovery has two distinct "no URL yet" outcomes. While it is still resolving
 * the query is disabled and we show a loading state. Once it has settled without
 * a Semaphore URL (Semaphore undiscoverable / unavailable) we render a terminal
 * unavailable state — not an endless spinner, and not a misleading not-found.
 */
export default function NotificationDetailPageClient({
  id,
}: NotificationDetailPageClientProps) {
  const { url, isResolving, isUnavailable } = useSemaphoreUrlState();
  const { notification, isLoading, isError, error } = useAdminNotification(
    url ?? '',
    id
  );

  const resolvedError = isUnavailable
    ? UNAVAILABLE_ERROR
    : isError
      ? error
      : null;

  return (
    <NotificationDetailView
      notification={notification}
      isLoading={isLoading || isResolving}
      error={resolvedError}
    />
  );
}
