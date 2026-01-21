import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../lib/config/rsc';
import NewTokenPageClient from './NewTokenPageClient';

const pageDescription =
  'Create a new API access token for programmatic access to the Rubin Science Platform';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Create an RSP access token | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Create an RSP access token',
      description: pageDescription,
    },
  };
}

export default function NewTokenPage() {
  return <NewTokenPageClient />;
}
