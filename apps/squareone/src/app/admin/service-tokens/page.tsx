import type { Metadata } from 'next';

import AdminRequired from '../../../components/AdminRequired';
import { getStaticConfig } from '../../../lib/config/rsc';
import ServiceTokenPageClient from './ServiceTokenPageClient';

const pageDescription =
  'Create and manage Gafaelfawr service tokens for bot users';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Service tokens | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Service tokens',
      description: pageDescription,
    },
  };
}

/**
 * Service-token admin page.
 *
 * Server component that mirrors the Sentry admin page: it derives the page
 * metadata from the resolved app config and renders the client component that
 * holds the page UI. The page gates itself on the `serviceTokens` page scopes
 * so a direct visit by someone whose scopes reach a different admin page is
 * refused here rather than 403-ing request by request.
 */
export default function ServiceTokenPage() {
  return (
    <AdminRequired pageId="serviceTokens">
      <ServiceTokenPageClient />
    </AdminRequired>
  );
}
