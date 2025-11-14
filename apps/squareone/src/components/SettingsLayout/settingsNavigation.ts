import type { AppConfigContextValue } from '../../contexts/AppConfigContext';
import type { NavSection } from '../SidebarLayout';

/**
 * Generates settings navigation configuration based on app config.
 * Filters navigation items based on configuration settings.
 */
export function getSettingsNavigation(
  _config: AppConfigContextValue
): NavSection[] {
  const navigation: NavSection[] = [
    {
      items: [
        { href: '/settings', label: 'Account' },
        { href: '/settings/tokens', label: 'Access tokens' },
        { href: '/settings/quotas', label: 'Quotas' },
        { href: '/settings/sessions', label: 'Sessions' },
      ],
    },
  ];

  return navigation;
}
