import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Options forwarded to `router.push`, derived from the App Router's own `push`
 * signature so this stays in sync with Next.js (e.g. `{ scroll: false }`).
 */
type PushOptions = Parameters<ReturnType<typeof useRouter>['push']>[1];

/**
 * Mutate a copy of the current URL query parameters in place.
 *
 * The callback receives a mutable {@link URLSearchParams} cloned from the
 * current URL, so it can `set`/`delete` keys while unrelated parameters are
 * preserved.
 */
type QueryParamsMutator = (params: URLSearchParams) => void;

/**
 * Push a new URL after mutating the current query parameters.
 *
 * @param mutate - Mutates a clone of the current query parameters in place.
 * @param options - Optional navigation options forwarded to `router.push`
 *   (e.g. `{ scroll: false }`). When omitted, `router.push` is called with the
 *   URL only, matching the App Router default.
 */
type PushQueryParams = (
  mutate: QueryParamsMutator,
  options?: PushOptions
) => void;

/**
 * Centralize the "clone the current query params, mutate them, and push the
 * resulting URL" idiom shared by the URL-backed filter hooks
 * ({@link useUnreadOnlyFilter}, {@link useAdminNotificationFilters},
 * {@link useTokenHistoryFilters}).
 *
 * The returned callback clones the current `searchParams` into a mutable
 * `URLSearchParams`, hands it to the caller's `mutate` function, then pushes
 * `pathname` with the resulting query string appended (or the bare `pathname`
 * when no parameters remain). Cloning keeps unrelated query parameters intact.
 *
 * Uses the Next.js App Router navigation hooks (`useRouter`, `usePathname`,
 * `useSearchParams`); callers must therefore sit under a `<Suspense>` boundary.
 *
 * @returns A stable callback that mutates the query string and navigates.
 */
export default function usePushQueryParams(): PushQueryParams {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (mutate: QueryParamsMutator, options?: PushOptions) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      // Preserve exact call arity: only forward options when provided so a
      // caller expecting `push(url)` is not silently changed to
      // `push(url, undefined)`.
      if (options === undefined) {
        router.push(url);
      } else {
        router.push(url, options);
      }
    },
    [router, pathname, searchParams]
  );
}
