import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getStaticConfig } from '../../../../lib/config/rsc';
import NewNotificationPageClient from './NewNotificationPageClient';

const pageDescription =
  'Send a Markdown-formatted notification to a Rubin Science Platform user';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Send a notification | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Send a notification',
      description: pageDescription,
    },
  };
}

/**
 * Compose-notification admin page.
 *
 * Server component that mirrors the other admin pages: it derives the page
 * metadata from the resolved app config and renders the client component that
 * holds the compose flow. The page sits inside the admin section, so it
 * inherits the `AdminRequired` / `exec:admin` gate from the admin layout.
 *
 * The client component reads query parameters via `useSearchParams()` to
 * pre-fill the form, so it must sit under a `<Suspense>` boundary to satisfy the
 * App Router's static-rendering requirement.
 */
export default function NewNotificationPage() {
  return (
    <Suspense>
      <NewNotificationPageClient />
    </Suspense>
  );
}
