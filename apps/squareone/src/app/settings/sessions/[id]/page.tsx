import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../lib/config/rsc';
import SessionDetailPageClient from './SessionDetailPageClient';

const pageDescription =
  'View details and change history for an RSP session token';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Session Token Details | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Session Token Details',
      description: pageDescription,
    },
  };
}

type SessionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { id } = await params;
  return <SessionDetailPageClient tokenKey={id} />;
}
