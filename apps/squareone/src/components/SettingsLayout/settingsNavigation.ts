import type { NavSection } from '../SidebarLayout';

/**
 * Static settings navigation configuration.
 * Returns navigation sections for the Settings pages.
 */
export function getSettingsNavigation(): NavSection[] {
  return [
    {
      items: [{ href: '/settings', label: 'Account' }],
    },
    {
      items: [{ href: '/settings/tokens', label: 'Access Tokens' }],
    },
    {
      label: 'Security',
      items: [{ href: '/settings/sessions', label: 'Sessions' }],
    },
  ];
}
