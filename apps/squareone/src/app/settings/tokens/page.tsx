import type { Metadata } from 'next';

import { getStaticConfig } from '../../../lib/config/rsc';
import TokensPageClient from './TokensPageClient';

const pageDescription = 'Manage your RSP API access tokens';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Access tokens | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Access Tokens',
      description: pageDescription,
    },
  };
}

export default function TokensPage() {
  return <TokensPageClient />;
}
