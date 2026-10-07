import type { Metadata } from 'next';

import { getStaticConfig } from '../../lib/config/rsc';
import AdminOverviewClient from './AdminOverviewClient';

const pageDescription =
  'An overview of this Rubin Science Platform environment from service discovery';

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
 * Admin index route: the environment overview.
 *
 * A thin server component that renders {@link AdminOverviewClient}, which
 * reads Repertoire service discovery in the browser. The admin layout's
 * any-admin `AdminRequired` gate already guards this page, and the overview
 * needs no page scope of its own.
 */
export default function AdminPage() {
  return <AdminOverviewClient />;
}
