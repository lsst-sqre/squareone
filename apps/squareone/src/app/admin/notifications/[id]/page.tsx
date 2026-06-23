import type { Metadata } from 'next';

import { getStaticConfig } from '@/lib/config/rsc';

import NotificationDetailPageClient from './NotificationDetailPageClient';

const pageDescription = 'View a single user notification';

type NotificationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: NotificationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const config = await getStaticConfig();
  return {
    title: `Notification ${id} | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: `Notification ${id}`,
      description: pageDescription,
    },
  };
}

/**
 * Admin notification detail page.
 *
 * Server component that mirrors the other admin pages: it derives the page
 * metadata from the resolved app config and the route id, then renders the
 * client container that fetches and displays the notification. The page sits
 * inside the admin section, so it inherits the `AdminRequired` / `exec:admin`
 * gate from the admin layout.
 */
export default async function NotificationDetailPage({
  params,
}: NotificationDetailPageProps) {
  const { id } = await params;
  return <NotificationDetailPageClient id={id} />;
}
