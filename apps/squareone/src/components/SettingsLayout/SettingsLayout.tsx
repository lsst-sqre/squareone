import type { ReactElement } from 'react';
import { SidebarLayout } from '../SidebarLayout';
import { getSettingsNavigation } from './settingsNavigation';

type SettingsLayoutProps = {
  children: React.ReactNode;
};

/**
 * Settings-specific layout that uses SidebarLayout with static navigation configuration.
 * This component provides the sidebar navigation for all Settings pages.
 */
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  // Static navigation sections for Settings
  const navSections = getSettingsNavigation();

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
