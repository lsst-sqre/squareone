import type { Metadata } from 'next';

import AdminRequired from '../../../../components/AdminRequired';
import { getStaticConfig } from '../../../../lib/config/rsc';
import NewOIDCClientPageClient from './NewOIDCClientPageClient';

const pageDescription =
  "Register a new OpenID Connect client with this environment's Gafaelfawr";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Register an OIDC client | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Register an OIDC client',
      description: pageDescription,
    },
  };
}

/**
 * OpenID Connect client creation page.
 *
 * Server component that mirrors the OIDC client listing page: it derives the
 * page metadata from the resolved app config and renders the client component
 * that holds the create flow. The page gates itself on the `oidcClients` page
 * scopes so a direct visit by someone whose scopes reach a different admin
 * page is refused here rather than offering a form whose submit would 403.
 */
export default function NewOIDCClientPage() {
  return (
    <AdminRequired pageId="oidcClients">
      <NewOIDCClientPageClient />
    </AdminRequired>
  );
}
