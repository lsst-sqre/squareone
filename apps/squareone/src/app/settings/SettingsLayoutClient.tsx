'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo } from 'react';
import { getSettingsNavigation } from '../../components/SettingsLayout/settingsNavigation';
import { SidebarLayout } from '../../components/SidebarLayout';
import type { AppConfigContextValue } from '../../hooks/useStaticConfig';

type SettingsLayoutClientProps = {
  children: ReactNode;
  config: AppConfigContextValue;
};

/**
 * Client component for settings layout.
 *
 * Receives config as a prop from the server component layout.
 * Uses usePathname() from next/navigation (App Router) to get
 * the current path for navigation highlighting.
 */
export default function SettingsLayoutClient({
  children,
  config,
}: SettingsLayoutClientProps) {
  const pathname = usePathname();

  // Dynamically generate navigation based on config
  const navSections = useMemo(() => getSettingsNavigation(config), [config]);

  return (
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={navSections}
      currentPath={pathname}
    >
      {children}
    </SidebarLayout>
  );
}
