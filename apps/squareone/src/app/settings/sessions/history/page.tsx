import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../lib/config/rsc';
import SessionHistoryPageClient from './SessionHistoryPageClient';

const pageDescription = 'View the change history for your RSP session tokens';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Session History | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Session History',
      description: pageDescription,
    },
  };
}

export default function SessionHistoryPage() {
  return <SessionHistoryPageClient />;
}
