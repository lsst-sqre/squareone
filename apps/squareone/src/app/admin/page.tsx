import type { Metadata } from 'next';

import { getStaticConfig } from '../../lib/config/rsc';
import AdminIndexClient from './AdminIndexClient';

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
 * A thin server component: it resolves the app config (which carries the
 * scope → page mapping) and hands it to {@link AdminIndexClient}, which does
 * the redirecting. The redirect target depends on the signed-in user's
 * Gafaelfawr scopes, so it cannot be decided here on the server.
 */
export default async function AdminPage() {
  const config = await getStaticConfig();

  return <AdminIndexClient config={config} />;
}
