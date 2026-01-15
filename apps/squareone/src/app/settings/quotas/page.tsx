import type { Metadata } from 'next';

import { getStaticConfig } from '../../../lib/config/rsc';
import QuotasPageClient from './QuotasPageClient';

const pageDescription =
  'Information about limits to your resource usage on the Rubin Science Platform';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Quotas | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Quotas',
      description: pageDescription,
    },
  };
}

export default function QuotasPage() {
  return <QuotasPageClient />;
}
