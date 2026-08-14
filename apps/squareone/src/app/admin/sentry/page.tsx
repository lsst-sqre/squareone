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
        Verify the Sentry monitoring integration by triggering test events.
        “Throw uncaught error” and “Capture handled exception” both report
        errors, which appear as issues in the Sentry project.
      </p>
      <p>
        “Emit server log” is different: it makes the server emit pino warn and
        error records, which the Sentry Logs bridge ships to Sentry{' '}
        <strong>Logs</strong>, never to Issues. Look for them under{' '}
        <strong>Explore &gt; Logs</strong> in Sentry, searching for the marker
        shown in the status readout below the buttons.
      </p>
      <SentryTestButtons />
      <SentryConfigInfo />
    </div>
  );
}
