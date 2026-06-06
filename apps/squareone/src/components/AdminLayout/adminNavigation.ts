import type { AppConfigContextValue } from '../../hooks/useStaticConfig';
import type { NavSection } from '../SidebarLayout';

/**
 * Generates admin navigation configuration based on app config.
 *
 * The admin navigation is flat (a single section with no category label).
 * Additional admin pages are added as further items in this section; the
 * `/admin` index route redirects to the first item via
 * {@link getFirstNavItemHref}, so ordering this list controls the redirect
 * target.
 */
export function getAdminNavigation(
  _config: AppConfigContextValue
): NavSection[] {
  const navigation: NavSection[] = [
    {
      items: [
        { href: '/admin/sentry', label: 'Sentry' },
        { href: '/admin/service-token', label: 'Service tokens' },
      ],
    },
  ];

  return navigation;
}
