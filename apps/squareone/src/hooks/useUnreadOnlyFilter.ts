import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import usePushQueryParams from './usePushQueryParams';

/** Query-string key mirroring the "Show unread only" filter. */
const UNREAD_PARAM = 'unread';

type UseUnreadOnlyFilterReturn = {
  /** Whether the inbox is filtered to unread notifications only. */
  showUnreadOnly: boolean;
  /** Reflect the "Show unread only" toggle into the URL query string. */
  setShowUnreadOnly: (showUnreadOnly: boolean) => void;
};

/**
 * Manage the user notifications "Show unread only" filter via the URL query
 * string, so a filtered inbox can be bookmarked or shared and is reproduced
 * exactly when the URL is loaded (`/notifications?unread=true`).
 *
 * Modeled on {@link useAdminNotificationFilters}: the URL is the single source
 * of truth. The flag is serialized as the explicit `unread=true` (rather than a
 * valueless `?unread`) so it round-trips through `URLSearchParams` and stays
 * composable with any future query parameters. Reading is strict — only
 * `unread=true` enables the filter — and clearing it deletes the parameter
 * rather than writing `unread=false`, keeping the default view's URL clean.
 *
 * Uses the Next.js App Router navigation hooks (`useRouter`, `usePathname`,
 * `useSearchParams`); the caller must therefore sit under a `<Suspense>`
 * boundary. Navigations pass `scroll: false` so toggling the filter does not
 * jump the viewport to the top of the page.
 *
 * @returns The current `showUnreadOnly` flag and a `setShowUnreadOnly` updater.
 */
export default function useUnreadOnlyFilter(): UseUnreadOnlyFilterReturn {
  const searchParams = useSearchParams();
  const pushQueryParams = usePushQueryParams();

  const showUnreadOnly = searchParams.get(UNREAD_PARAM) === 'true';

  const setShowUnreadOnly = useCallback(
    (value: boolean) => {
      pushQueryParams(
        (params) => {
          if (value) {
            params.set(UNREAD_PARAM, 'true');
          } else {
            params.delete(UNREAD_PARAM);
          }
        },
        { scroll: false }
      );
    },
    [pushQueryParams]
  );

  return { showUnreadOnly, setShowUnreadOnly };
}
