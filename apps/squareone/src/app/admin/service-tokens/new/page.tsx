import type { Metadata } from 'next';
import { Suspense } from 'react';

import AdminRequired from '../../../../components/AdminRequired';
import { getStaticConfig } from '../../../../lib/config/rsc';
import NewServiceTokenPageClient from './NewServiceTokenPageClient';

const pageDescription = 'Create a Gafaelfawr service token for a bot user';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Create a service token | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Create a service token',
      description: pageDescription,
    },
  };
}

/**
 * New-service-token admin page.
 *
 * Server component that mirrors the other admin pages: it derives the page
 * metadata from the resolved app config and renders the client component that
 * holds the creation flow. The page gates itself on the `serviceTokens` page
 * scopes, so a direct visit without them is refused in-page.
 *
 * The client component reads query parameters via `useSearchParams()` to
 * pre-fill the form, so it must sit under a `<Suspense>` boundary to satisfy the
 * App Router's static-rendering requirement.
 */
export default function NewServiceTokenPage() {
  return (
    <AdminRequired pageId="serviceTokens">
      <Suspense>
        <NewServiceTokenPageClient />
      </Suspense>
    </AdminRequired>
  );
}
