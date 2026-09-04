'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminNavigation } from '../../components/AdminLayout/adminNavigation';
import AdminRequired from '../../components/AdminRequired';
import { SidebarLayout } from '../../components/SidebarLayout';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
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
 * navigation highlighting. The admin navigation is flat (no categories) and is
 * filtered to the pages the signed-in user holds scopes for, per the
 * `adminPageScopes` configuration — so the sidebar never offers a page that
 * would answer 403.
 *
 * Wraps the layout in AdminRequired so the whole section inherits the
 * client-side gate on the union of the configured admin scopes
 * (defense-in-depth alongside the Phalanx ingress). Someone who can reach no
 * admin page at all sees the gate's message instead of the admin sidebar and
 * content; each page additionally gates on its own configured scopes.
 */
export default function AdminLayoutClient({
  children,
  config,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const repertoireUrl = useRepertoireUrl();
  const { query } = useLoginInfo(repertoireUrl);

  // Navigation is derived from config and the user's scopes on every render:
  // it is a filter over a handful of static items, and nothing downstream keys
  // an effect on the array's identity.
  const navSections = getAdminNavigation(config, query?.scopes ?? []);

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
