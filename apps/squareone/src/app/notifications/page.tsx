import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getStaticConfig } from '../../lib/config/rsc';
import NotificationsPageClient from './NotificationsPageClient';

const pageDescription =
  'Notifications sent to you on the Rubin Science Platform';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Notifications | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Notifications',
      description: pageDescription,
    },
  };
}

/**
 * User-facing notifications inbox page.
 *
 * Server component gated on the `enableUserNotifications` feature flag: when the
 * flag is off it calls `notFound()` so the whole feature stays hidden (the route
 * 404s) until release. When on, it renders the client container inside a
 * `<Suspense>` boundary; the client is wrapped in `AuthRequired` (login only, no
 * admin scope), so logged-out users are redirected to log in.
 */
export default async function NotificationsPage() {
  const config = await getStaticConfig();

  if (!config.enableUserNotifications) {
    notFound();
  }

  return (
    <Suspense>
      <NotificationsPageClient />
    </Suspense>
  );
}
