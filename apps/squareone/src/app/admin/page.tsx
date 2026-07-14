import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getAdminNavigation } from '../../components/AdminLayout/adminNavigation';
// Import the helper from its module (not the SidebarLayout barrel) so this
// server component does not pull in the client-only SidebarLayout component.
import { getFirstNavItemHref } from '../../components/SidebarLayout/getFirstNavItemHref';
import { getStaticConfig } from '../../lib/config/rsc';

const pageDescription = 'Administrative tools for the Rubin Science Platform';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Admin | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Admin',
      description: pageDescription,
    },
  };
}

/**
 * Admin index route.
 *
 * Redirects to the first item in the admin sidebar navigation (currently
 * `/admin/sentry`). Reordering `getAdminNavigation()` changes the target with
 * no other code change. When the navigation is empty, renders a fallback
 * (with a top-level heading, since the redirect no longer takes over the page)
 * instead of redirecting.
 */
export default async function AdminPage() {
  const config = await getStaticConfig();
  const firstNavItemHref = getFirstNavItemHref(getAdminNavigation(config));

  if (firstNavItemHref) {
    redirect(firstNavItemHref);
  }

  return (
    <div>
      <h1>Admin</h1>
      <p>No admin pages are available.</p>
    </div>
  );
}
