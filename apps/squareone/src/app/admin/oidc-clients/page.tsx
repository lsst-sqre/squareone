import type { Metadata } from 'next';

import AdminRequired from '../../../components/AdminRequired';
import { getStaticConfig } from '../../../lib/config/rsc';
import OIDCClientsPageClient from './OIDCClientsPageClient';

const pageDescription =
  "Manage the OpenID Connect clients registered with this environment's Gafaelfawr";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `OIDC clients | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'OIDC clients',
      description: pageDescription,
    },
  };
}

/**
 * OpenID Connect client admin page.
 *
 * Server component that mirrors the service-token admin page: it derives the
 * page metadata from the resolved app config and renders the client component
 * that holds the page UI. The page gates itself on the `oidcClients` page
 * scopes so a direct visit by someone whose scopes reach a different admin
 * page is refused here rather than 403-ing request by request.
 */
export default function OIDCClientsPage() {
  return (
    <AdminRequired pageId="oidcClients">
      <OIDCClientsPageClient />
    </AdminRequired>
  );
}
