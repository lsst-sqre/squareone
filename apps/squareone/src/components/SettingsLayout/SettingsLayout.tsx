import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { SidebarLayout } from '../SidebarLayout';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { getSettingsNavigation } from './settingsNavigation';

type SettingsLayoutProps = {
  children: React.ReactNode;
};

/**
 * Settings-specific layout that uses SidebarLayout with dynamic navigation configuration.
 * This component provides the sidebar navigation for all Settings pages,
 * filtered based on application configuration.
 */
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const config = useAppConfig();

  // Dynamically filter navigation based on config
  const navSections = useMemo(() => getSettingsNavigation(config), [config]);

  // Static title for now
  const sidebarTitle = 'Settings';

  return (
    <SidebarLayout sidebarTitle={sidebarTitle} navSections={navSections}>
      {children}
    </SidebarLayout>
  );
}

/**
 * Layout function for Next.js getLayout pattern.
 * Maintains smooth transitions between settings pages.
 */
export function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
}
