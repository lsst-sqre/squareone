'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo } from 'react';
import { getAdminNavigation } from '../../components/AdminLayout/adminNavigation';
import AdminRequired from '../../components/AdminRequired';
import { SidebarLayout } from '../../components/SidebarLayout';
import type { AppConfigContextValue } from '../../hooks/useStaticConfig';

type AdminLayoutClientProps = {
  children: ReactNode;
  config: AppConfigContextValue;
};

/**
 * Client component for the admin layout.
 *
 * Receives config as a prop from the server component layout. Uses
 * usePathname() from next/navigation (App Router) to get the current path for
 * navigation highlighting. The admin navigation is flat (no categories).
 *
 * Wraps the layout in AdminRequired so every admin page inherits the
 * client-side `exec:admin` scope gate (defense-in-depth alongside the Phalanx
 * ingress). Unauthorized users see the gate's message instead of the admin
 * sidebar and content.
 */
export default function AdminLayoutClient({
  children,
  config,
}: AdminLayoutClientProps) {
  const pathname = usePathname();

  // Dynamically generate navigation based on config
  const navSections = useMemo(() => getAdminNavigation(config), [config]);

  return (
    <AdminRequired>
      <SidebarLayout
        sidebarTitle="Admin"
        navSections={navSections}
        currentPath={pathname}
      >
        {children}
      </SidebarLayout>
    </AdminRequired>
  );
}
