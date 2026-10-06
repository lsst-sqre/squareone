import type { AppConfigContextValue } from '../../hooks/useStaticConfig';
import {
  type AdminPageId,
  hasAdminPageAccess,
} from '../../lib/config/adminPageScopes';
import type { NavItem, NavSection } from '../SidebarLayout';

/**
 * A nav item, tagged with the page id its scopes are configured under.
 *
 * An item without a `pageId` is ungated: it is visible to everyone the admin
 * layout's any-admin `AdminRequired` gate admits, whichever page scopes they
 * hold.
 */
type AdminNavItem = NavItem & { pageId?: AdminPageId };

/**
 * The admin pages, in the order they appear in the sidebar.
 *
 * Order is code-defined and deliberately not configurable. The `/admin`
 * overview leads the list and is ungated, so every admin user has somewhere to
 * land. Adding a gated page means adding its id to `ADMIN_PAGE_IDS` (and the
 * config schema) as well as an entry here; an ungated page needs only the
 * entry.
 */
const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Overview' },
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
 * The navigation is flat (a single section with no category label). Ungated
 * items (those without a `pageId`, such as the Overview) are always included;
 * gated pages appear only when their configured scopes (see
 * `adminPageScopes.ts`) intersect the user's Gafaelfawr scopes, so nobody is
 * offered a page that would answer 403. Ungated items are not filtered here
 * because the admin layout's `AdminRequired` gate already keeps out anyone
 * who can reach no admin page.
 */
export function getAdminNavigation(
  config: AppConfigContextValue,
  userScopes: readonly string[]
): NavSection[] {
  const items = ADMIN_NAV_ITEMS.filter(
    (item) =>
      item.pageId === undefined ||
      hasAdminPageAccess(config, userScopes, item.pageId)
  ).map(({ href, label }) => ({ href, label }));

  return items.length > 0 ? [{ items }] : [];
}
