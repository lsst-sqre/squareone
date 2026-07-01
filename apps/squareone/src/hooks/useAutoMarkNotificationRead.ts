'use client';

import { useMarkNotificationsRead } from '@lsst-sqre/semaphore-client';
import { useEffect, useRef } from 'react';

/**
 * Parameters for {@link useAutoMarkNotificationRead}.
 */
export type UseAutoMarkNotificationReadParams = {
  /** Base URL of the Semaphore service, or `undefined` before discovery. */
  semaphoreUrl: string | undefined;
  /** CSRF token from Gafaelfawr login info, or `null`/`undefined` if absent. */
  csrfToken: string | null | undefined;
  /** The notification id being viewed. */
  id: string;
  /** Whether that notification is currently unread. */
  isUnread: boolean;
};

/**
 * Auto-mark a notification read once its body is viewed.
 *
 * Both places that reveal a body — the inbox's expand-in-place row and the
 * `/notifications/[id]` detail page — share this hook so the read semantics live
 * in one spot. When the notification is unread (and the Semaphore URL and CSRF
 * token are available), it fires {@link useMarkNotificationsRead} for that id;
 * the mutation's data-layer `onSuccess` invalidates the inbox list, the unread
 * count, and the detail query, so the row status and header badge update without
 * a manual refresh.
 *
 * Re-mark loops are guarded two ways: it never fires for an already-read
 * notification (`isUnread` is `false`), and a per-id ref ensures a single POST
 * even across the brief window where a refetch still reports the old unread
 * state before the cache settles. The mock and real endpoints are idempotent, so
 * a redundant POST would be harmless anyway — but this avoids one entirely.
 */
export function useAutoMarkNotificationRead({
  semaphoreUrl,
  csrfToken,
  id,
  isUnread,
}: UseAutoMarkNotificationReadParams): void {
  const { mutate } = useMarkNotificationsRead(semaphoreUrl ?? '');
  // The last id we have already marked, so a re-render (or a transient unread
  // refetch) for the same notification does not POST again.
  const markedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!semaphoreUrl || !csrfToken || !id || !isUnread) {
      return;
    }
    if (markedIdRef.current === id) {
      return;
    }
    markedIdRef.current = id;
    mutate({ ids: [id], csrfToken });
  }, [semaphoreUrl, csrfToken, id, isUnread, mutate]);
}
