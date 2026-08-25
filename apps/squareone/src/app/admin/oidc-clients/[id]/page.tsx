import type { Metadata } from 'next';

import AdminRequired from '../../../../components/AdminRequired';
import { getStaticConfig } from '../../../../lib/config/rsc';
import OIDCClientDetailPageClient from './OIDCClientDetailPageClient';

const pageDescription =
  'View, edit, or delete a registered OpenID Connect client';

type OIDCClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OIDCClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const config = await getStaticConfig();
  return {
    title: `OIDC client ${id} | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: `OIDC client ${id}`,
      description: pageDescription,
    },
  };
}

/**
 * OpenID Connect client detail page.
 *
 * Server component that mirrors the rest of the OIDC client routes: it derives
 * the page metadata from the resolved app config and the route id, then renders
 * the client container holding the metadata, edit, and delete flows. The page
 * gates itself on the `oidcClients` page scopes so a direct visit by someone
 * whose scopes reach a different admin page is refused here rather than offering
 * an edit form and a Delete button whose requests would 403.
 *
 * The title carries the raw client id rather than the client's description:
 * metadata is generated on the server, where the client has not been fetched,
 * and fetching it here purely for a title would double the request and leak a
 * 404 into the metadata pass.
 */
export default async function OIDCClientDetailPage({
  params,
}: OIDCClientDetailPageProps) {
  const { id } = await params;
  return (
    <AdminRequired pageId="oidcClients">
      <OIDCClientDetailPageClient clientId={id} />
    </AdminRequired>
  );
}
