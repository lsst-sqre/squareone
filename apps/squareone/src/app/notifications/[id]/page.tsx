import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import MainContent from '../../../components/MainContent';
import { getStaticConfig } from '../../../lib/config/rsc';
import NotificationDetailPageClient from './NotificationDetailPageClient';

const pageDescription =
  'View a notification sent to you on the Rubin Science Platform';

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
 * User-facing notification detail page (deep-linkable `/notifications/[id]`).
 *
 * Server component gated on the `enableUserNotifications` feature flag: when the
 * flag is off it calls `notFound()` so the whole feature stays hidden (the route
 * 404s) until release. When on, it renders the client container, passing the
 * awaited route id; the client is wrapped in `AuthRequired` (login only, no admin
 * scope), so logged-out users are redirected to log in.
 */
export default async function NotificationDetailPage({
  params,
}: NotificationDetailPageProps) {
  const { id } = await params;
  const config = await getStaticConfig();

  if (!config.enableUserNotifications) {
    notFound();
  }

  return (
    <MainContent>
      <NotificationDetailPageClient id={id} />
    </MainContent>
  );
}
