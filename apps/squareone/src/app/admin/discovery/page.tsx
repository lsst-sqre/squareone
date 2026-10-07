import type { Metadata } from 'next';

import { getStaticConfig } from '../../../lib/config/rsc';
import DiscoveryPageClient from './DiscoveryPageClient';

const pageDescription =
  "This Rubin Science Platform environment's raw Repertoire service discovery document";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Service discovery | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Service discovery',
      description: pageDescription,
    },
  };
}

/**
 * Admin service discovery route: the raw Repertoire discovery document.
 *
 * A thin server component that renders {@link DiscoveryPageClient}, which
 * reads service discovery in the browser. The admin layout's any-admin
 * `AdminRequired` gate already guards this page, and like the overview it
 * needs no page scope of its own.
 */
export default function DiscoveryPage() {
  return <DiscoveryPageClient />;
}
