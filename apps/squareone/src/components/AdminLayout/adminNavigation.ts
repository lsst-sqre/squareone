import type { AppConfigContextValue } from '../../hooks/useStaticConfig';
import {
  type AdminPageId,
  hasAdminPageAccess,
} from '../../lib/config/adminPageScopes';
import type { NavItem, NavSection } from '../SidebarLayout';

/** A nav item tagged with the page id its scopes are configured under. */
type AdminNavItem = NavItem & { pageId: AdminPageId };

/**
 * The admin pages, in the order they appear in the sidebar.
 *
 * Order is code-defined and deliberately not configurable: the `/admin` index
 * redirects to the first item a user can see, so this list also decides where
 * each person lands. Adding a page means adding its id to `ADMIN_PAGE_IDS`
 * (and the config schema) as well as an entry here.
 */
const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    pageId: 'notifications',
    href: '/admin/notifications',
    label: 'User notifications',
  },
  {
    pageId: 'serviceTokens',
    href: '/admin/service-tokens',
    label: 'Service tokens',
  },
  {
    pageId: 'oidcClients',
    href: '/admin/oidc-clients',
    label: 'OIDC clients',
  },
  { pageId: 'sentry', href: '/admin/sentry', label: 'Sentry' },
];

/**
 * Builds the admin sidebar navigation for a user holding `userScopes`.
 *
 * The navigation is flat (a single section with no category label) and shows
 * only the pages whose configured scopes (see `adminPageScopes.ts`) intersect
 * the user's Gafaelfawr scopes, so nobody is offered a page that would answer
 * 403. When no page is visible the result is empty, which callers such as
 * {@link getFirstNavItemHref} treat as "nothing to navigate to".
 */
export function getAdminNavigation(
  config: AppConfigContextValue,
  userScopes: readonly string[]
): NavSection[] {
  const items = ADMIN_NAV_ITEMS.filter((item) =>
    hasAdminPageAccess(config, userScopes, item.pageId)
  ).map(({ href, label }) => ({ href, label }));

  return items.length > 0 ? [{ items }] : [];
}
