'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { Button, Note } from '@lsst-sqre/squared';

import AdminOverview from '../../components/AdminOverview';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { isEmptyDiscovery } from '../../lib/admin/overview';
import styles from './AdminOverviewClient.module.css';

/**
 * Client container for the `/admin` environment overview.
 *
 * Reads Repertoire service discovery (the same cached query the header and
 * homepage use) and hands the document to the presentational
 * {@link AdminOverview}. What this component owns is the page's states:
 *
 * - No `repertoireUrl` configured: an informational note, since there is no
 *   discovery to describe the environment.
 * - Discovery pending: a loading state.
 * - Discovery failed or came back empty (a failed fetch resolves to the empty
 *   discovery rather than an error): a warning note with a retry button.
 *
 * The page sits behind the admin layout's any-admin `AdminRequired` gate and
 * needs no page scope of its own. Should a section need the viewer's scopes,
 * they come from `useUserScopes`.
 */
export default function AdminOverviewClient() {
  const repertoireUrl = useRepertoireUrl();
  const { discovery, isPending, isError, refetch } = useServiceDiscovery(
    repertoireUrl ?? ''
  );

  // Without a URL the discovery query is disabled and stays pending forever,
  // so this check comes before the pending one.
  if (!repertoireUrl) {
    return (
      <div>
        <h1>Overview</h1>
        <Note type="info">
          Service discovery is not configured for this environment, so there is
          no overview to show. Set <code>repertoireUrl</code> in the Squareone
          configuration to enable it.
        </Note>
      </div>
    );
  }

  if (isPending) {
    return (
      <div>
        <h1>Overview</h1>
        <div className={styles.state}>Loading service discovery…</div>
      </div>
    );
  }

  if (isError || !discovery || isEmptyDiscovery(discovery)) {
    return (
      <div>
        <h1>Overview</h1>
        <Note type="warning">
          <p>
            Could not load service discovery from Repertoire, so there is no
            overview to show.
          </p>
          <Button
            appearance="outline"
            tone="secondary"
            size="sm"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Note>
      </div>
    );
  }

  return <AdminOverview discovery={discovery} />;
}
