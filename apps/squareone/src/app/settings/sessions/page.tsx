import type { Metadata } from 'next';

import { getStaticConfig } from '../../../lib/config/rsc';
import SessionsPageClient from './SessionsPageClient';

const pageDescription = 'Manage your session tokens';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Sessions | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Sessions',
      description: pageDescription,
    },
  };
}

export default function SessionsPage() {
  return <SessionsPageClient />;
}
