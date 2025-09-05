import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { SidebarLayout } from '../SidebarLayout';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { useGafaelfawrUser } from '@lsst-sqre/squared';
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
  const { user } = useGafaelfawrUser();

  // Dynamically filter navigation based on config
  const navSections = useMemo(() => getSettingsNavigation(config), [config]);

  // Dynamic title based on user context
  const sidebarTitle = user?.username
    ? `${user.username} Settings`
    : 'Settings';

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
