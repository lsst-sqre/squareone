import type { Metadata } from 'next';

import SentryConfigInfo from '../../../components/SentryConfigInfo';
import SentryTestButtons from '../../../components/SentryTestButtons';
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
 * Sentry admin page.
 *
 * Renders the Sentry test buttons that exercise the error-reporting pipeline,
 * plus a read-only summary of the runtime Sentry configuration (and a link to
 * the Sentry dashboard when the org/project are configured).
 */
export default function SentryAdminPage() {
  return (
    <div>
      <h1>Sentry</h1>
      <p>
        Verify the Sentry monitoring integration by triggering test errors that
        should appear in the Sentry project.
      </p>
      <SentryTestButtons />
      <SentryConfigInfo />
    </div>
  );
}
