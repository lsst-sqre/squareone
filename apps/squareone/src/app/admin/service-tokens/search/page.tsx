import type { Metadata } from 'next';
import { Suspense } from 'react';

import AdminRequired from '../../../../components/AdminRequired';
import { getStaticConfig } from '../../../../lib/config/rsc';
import SearchServiceTokensPageClient from './SearchServiceTokensPageClient';

const pageDescription =
  "Look up and revoke a bot user's Gafaelfawr service tokens";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Look up service tokens | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Look up service tokens',
      description: pageDescription,
    },
  };
}

/**
 * Service-token lookup admin page.
 *
 * Server component that mirrors the other admin pages: it derives the page
 * metadata from the resolved app config and renders the client component that
 * holds the `?q=`-driven lookup. The page gates itself on the `serviceTokens`
 * page scopes, so a direct visit without them is refused in-page.
 *
 * The client component reads the `?q=` query parameter via `useSearchParams()`,
 * so it must sit under a `<Suspense>` boundary to satisfy the App Router's
 * static-rendering requirement.
 */
export default function SearchServiceTokensPage() {
  return (
    <AdminRequired pageId="serviceTokens">
      <Suspense>
        <SearchServiceTokensPageClient />
      </Suspense>
    </AdminRequired>
  );
}
