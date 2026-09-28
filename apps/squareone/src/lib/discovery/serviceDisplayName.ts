/*
 * Display names for Repertoire service discovery entries, shared by every
 * page that labels a discovered service (the `/api-aspect` listing and the
 * quotas page's rate limits) so the same payload labels a service the same way
 * everywhere.
 */

/**
 * Resolve the human-facing name of a discovered service.
 *
 * Returns the discovery `title` when it has visible text, otherwise
 * `fallback`. A null, undefined, empty, or whitespace-only title counts as
 * absent: Repertoire 2.x publishes no titles, and the discovery schema accepts
 * any string, so a blank title must never become a blank label. A non-blank
 * title is returned verbatim.
 *
 * @param title - The service's discovery `title`, if any.
 * @param fallback - The name to use without a title, usually the raw service
 *   name (e.g. `tap`), or a curated label that itself falls back to it.
 */
export function serviceDisplayName(
  title: string | null | undefined,
  fallback: string
): string {
  return title?.trim() ? title : fallback;
}
