import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../lib/config/rsc';
import TokenHistoryPageClient from './TokenHistoryPageClient';

const pageDescription = 'View the change history for your RSP access tokens';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Access token history | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Access token history',
      description: pageDescription,
    },
  };
}

export default function TokenHistoryPage() {
  return <TokenHistoryPageClient />;
}
