import type { Metadata } from 'next';

import { getStaticConfig } from '../../../lib/config/rsc';

const pageDescription = 'Verify the Sentry monitoring integration';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Sentry | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Sentry',
      description: pageDescription,
    },
  };
}

/**
 * Placeholder for the Sentry admin page.
 *
 * The Sentry test buttons and read-only configuration are added in a later
 * slice; this minimal page exists so the `/admin` index redirect resolves.
 */
export default function SentryAdminPage() {
  return (
    <div>
      <h1>Sentry</h1>
      <p>Sentry monitoring administration.</p>
    </div>
  );
}
