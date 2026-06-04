import type { NavSection } from './SidebarLayout';

/**
 * Resolves the href of the first navigation item across the given sidebar
 * navigation sections.
 *
 * Reusable across sidebar sections that want an index route to redirect to
 * their first nav item. Returns `null` as a safe fallback when the navigation
 * is empty (no sections, or the first section has no items) so callers can
 * choose to render a fallback instead of redirecting.
 */
export function getFirstNavItemHref(navSections: NavSection[]): string | null {
  return navSections[0]?.items[0]?.href ?? null;
}
