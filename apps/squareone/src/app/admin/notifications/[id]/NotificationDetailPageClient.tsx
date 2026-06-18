'use client';

import { useAdminNotification } from '@lsst-sqre/semaphore-client';

import NotificationDetailView from '@/components/NotificationDetailView';
import { useSemaphoreUrl } from '@/hooks/useSemaphoreUrl';

export type NotificationDetailPageClientProps = {
  /** Opaque notification id from the `[id]` route segment. */
  id: string;
};

/**
 * Client container for the `/admin/notifications/[id]` detail page.
 *
 * Resolves the Semaphore base URL via Repertoire discovery and fetches the
 * single notification with {@link useAdminNotification}, handing the result to
 * the presentational {@link NotificationDetailView}. While discovery is still
 * pending the query is disabled, so that window is shown as a loading state
 * rather than a not-found.
 */
export default function NotificationDetailPageClient({
  id,
}: NotificationDetailPageClientProps) {
  const semaphoreUrl = useSemaphoreUrl();
  const { notification, isLoading, isError, error } = useAdminNotification(
    semaphoreUrl ?? '',
    id
  );

  const resolving = semaphoreUrl === undefined;

  return (
    <NotificationDetailView
      notification={notification}
      isLoading={isLoading || resolving}
      error={isError ? error : null}
    />
  );
}
