'use client';

import { Button, CodeBlock } from '@lsst-sqre/squared';
import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

import { getDiscoveryEndpointUrl } from '../../../lib/admin/overview';
import AdminDiscoveryGate, {
  type LoadedDiscovery,
} from '../AdminDiscoveryGate';
import styles from './DiscoveryPageClient.module.css';

/**
 * Client container for `/admin/discovery`, the raw Repertoire service
 * discovery document.
 *
 * {@link AdminDiscoveryGate} reads service discovery (the same cached query
 * the overview, header, and homepage use) and handles the not-configured,
 * loading, and error states, as on the overview. Once discovery has loaded,
 * the page shows the whole document as pretty-printed JSON in a `CodeBlock`
 * with line numbers and a copy button. There is no folding: the full document
 * renders, so the browser's find searches all of it.
 *
 * The page sits behind the admin layout's any-admin `AdminRequired` gate and
 * needs no page scope of its own.
 */
export default function DiscoveryPageClient() {
  return (
    <AdminDiscoveryGate title="Service discovery" subject="discovery document">
      {(loaded) => <DiscoveryDocument {...loaded} />}
    </AdminDiscoveryGate>
  );
}

/**
 * The loaded document: where it comes from, a note that it is cached with a
 * button to refetch it, and the JSON itself.
 */
function DiscoveryDocument({
  discovery,
  repertoireUrl,
  refetch,
  isFetching,
}: LoadedDiscovery) {
  const discoveryUrl = getDiscoveryEndpointUrl(repertoireUrl);
  const json = useMemo(() => JSON.stringify(discovery, null, 2), [discovery]);

  return (
    <div>
      <h1>Service discovery</h1>
      <p>
        The service discovery document that Repertoire publishes for this
        environment, from <a href={discoveryUrl}>{discoveryUrl}</a>.
      </p>
      <div className={styles.toolbar}>
        <p className={styles.staleness}>
          Squareone caches service discovery for 5 minutes, so this copy may be
          a few minutes old.
        </p>
        <Button
          appearance="outline"
          tone="secondary"
          size="sm"
          leadingIcon={RefreshCw}
          loading={isFetching}
          onClick={refetch}
        >
          Refetch
        </Button>
      </div>
      <CodeBlock
        code={json}
        language="json"
        lineNumbers
        copy
        ariaLabel="Service discovery JSON"
      />
    </div>
  );
}
