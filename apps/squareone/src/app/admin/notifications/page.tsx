import type { Metadata } from 'next';
import { Suspense } from 'react';

import AdminRequired from '../../../components/AdminRequired';
import { getStaticConfig } from '../../../lib/config/rsc';
import NotificationsPageClient from './NotificationsPageClient';

const pageDescription =
  'Browse and filter the user notifications sent via Semaphore';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `User notifications | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'User notifications',
      description: pageDescription,
    },
  };
}

/**
 * Admin user-notifications listing page.
 *
 * Server component that mirrors the other admin pages: it derives the page
 * metadata from the resolved app config and renders the client container that
 * fetches and displays the notifications. The page gates itself on the
 * `notifications` page scopes, so a direct visit without them is refused
 * in-page.
 *
 * The client container reads the filter state from the URL query string via
 * `useSearchParams()` (through `useAdminNotificationFilters`), so it must sit
 * under a `<Suspense>` boundary to satisfy the App Router's static-rendering
 * requirement.
 */
export default function NotificationsPage() {
  return (
    <AdminRequired pageId="notifications">
      <Suspense>
        <NotificationsPageClient />
      </Suspense>
    </AdminRequired>
  );
}
