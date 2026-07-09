import type { AdminNotificationFilters } from '@lsst-sqre/semaphore-client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import usePushQueryParams from './usePushQueryParams';

/**
 * Filter keys this hook serializes to and from the URL query string.
 *
 * `limit` (part of {@link AdminNotificationFilters}) is intentionally excluded:
 * page size is owned by the listing container, not the bookmarkable URL.
 */
type UrlFilterKey = 'recipient' | 'sender' | 'since' | 'until';

type UseAdminNotificationFiltersReturn = {
  filters: AdminNotificationFilters;
  setFilter: <K extends UrlFilterKey>(
    key: K,
    value: AdminNotificationFilters[K]
  ) => void;
  clearAllFilters: () => void;
};

/**
 * Parse a date from an ISO string in a URL parameter.
 */
function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Parse a string from a URL parameter.
 */
function parseString(value: string | null): string | undefined {
  return value || undefined;
}

/**
 * Manage admin notification filter state via the URL query string.
 *
 * Modeled on {@link useTokenHistoryFilters}: the URL is the single source of
 * truth for the `recipient`, `sender`, `since`, and `until` filters, so a
 * filtered view can be bookmarked or shared and is reproduced exactly when the
 * URL is loaded. Dates are serialized as ISO 8601 strings. Filters combine —
 * setting one preserves the others.
 *
 * Uses the Next.js App Router navigation hooks (`useRouter`, `usePathname`,
 * `useSearchParams`).
 *
 * @returns The current `filters`, a `setFilter` updater, and `clearAllFilters`.
 */
export default function useAdminNotificationFilters(): UseAdminNotificationFiltersReturn {
  const searchParams = useSearchParams();
  const pushQueryParams = usePushQueryParams();

  // Parse the current filters from the URL search params. Each filter key maps
  // directly to a query parameter of the same name (matching the Semaphore
  // admin list endpoint's query parameters).
  const filters = useMemo<AdminNotificationFilters>(
    () => ({
      recipient: parseString(searchParams.get('recipient')),
      sender: parseString(searchParams.get('sender')),
      since: parseDate(searchParams.get('since')),
      until: parseDate(searchParams.get('until')),
    }),
    [searchParams]
  );

  const setFilter = useCallback(
    <K extends UrlFilterKey>(key: K, value: AdminNotificationFilters[K]) => {
      pushQueryParams((params) => {
        if (value === undefined || value === null) {
          params.delete(key);
        } else if (value instanceof Date) {
          params.set(key, value.toISOString());
        } else {
          params.set(key, String(value));
        }
      });
    },
    [pushQueryParams]
  );

  const clearAllFilters = useCallback(() => {
    pushQueryParams((params) => {
      for (const key of Array.from(params.keys())) {
        params.delete(key);
      }
    });
  }, [pushQueryParams]);

  return { filters, setFilter, clearAllFilters };
}
