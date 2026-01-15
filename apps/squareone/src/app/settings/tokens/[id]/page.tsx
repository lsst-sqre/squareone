import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../lib/config/rsc';
import TokenDetailPageClient from './TokenDetailPageClient';

const pageDescription =
  'View details and change history for an RSP access token';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Token Details | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Token Details',
      description: pageDescription,
    },
  };
}

type TokenDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TokenDetailPage({
  params,
}: TokenDetailPageProps) {
  const { id } = await params;
  return <TokenDetailPageClient tokenKey={id} />;
}
