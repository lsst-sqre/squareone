import type { Metadata } from 'next';

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
 * holds the page UI. The page sits inside the admin section, so it inherits the
 * `AdminRequired` / `exec:admin` gate from the admin layout.
 */
export default function ServiceTokenPage() {
  return <ServiceTokenPageClient />;
}
