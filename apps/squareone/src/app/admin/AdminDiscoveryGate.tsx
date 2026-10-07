'use client';

import {
  type ServiceDiscovery,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { Button, Note } from '@lsst-sqre/squared';
import type { ReactNode } from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { isEmptyDiscovery } from '../../lib/admin/overview';
import styles from './AdminDiscoveryGate.module.css';

/** What a page built on {@link AdminDiscoveryGate} renders from. */
export type LoadedDiscovery = {
  /** The service discovery document. */
  discovery: ServiceDiscovery;
  /** The configured Repertoire URL the document came from. */
  repertoireUrl: string;
  /** Fetch the document again, bypassing the cache. */
  refetch: () => void;
  /** Whether a fetch, such as a refetch, is in flight. */
  isFetching: boolean;
};

type AdminDiscoveryGateProps = {
  /** The page's level-1 heading, shown above each note. */
  title: string;
  /**
   * What the page shows, completing "so there is no … to show", such as
   * "overview".
   */
  subject: string;
  /** Render the page once discovery has loaded. */
  children: (loaded: LoadedDiscovery) => ReactNode;
};

/**
 * Reads Repertoire service discovery (the same cached query the header and
 * homepage use) for an admin page built from it, and owns that page's states:
 *
 * - No `repertoireUrl` configured: an informational note, since there is no
 *   discovery to show.
 * - Discovery pending: a loading state.
 * - Discovery failed or came back empty (a failed fetch resolves to the empty
 *   discovery rather than an error): a warning note with a retry button.
 *
 * Once discovery has loaded, it renders `children` with the document. Each
 * note sits under the page's `title`, so the page keeps its heading in every
 * state.
 */
export default function AdminDiscoveryGate({
  title,
  subject,
  children,
}: AdminDiscoveryGateProps) {
  const repertoireUrl = useRepertoireUrl();
  const { discovery, isPending, isFetching, isError, refetch } =
    useServiceDiscovery(repertoireUrl ?? '');

  // Without a URL the discovery query is disabled and stays pending forever,
  // so this check comes before the pending one.
  if (!repertoireUrl) {
    return (
      <div>
        <h1>{title}</h1>
        <Note type="info">
          Service discovery is not configured for this environment, so there is
          no {subject} to show. Set <code>repertoireUrl</code> in the Squareone
          configuration to enable it.
        </Note>
      </div>
    );
  }

  if (isPending) {
    return (
      <div>
        <h1>{title}</h1>
        <div className={styles.state}>Loading service discovery…</div>
      </div>
    );
  }

  if (isError || !discovery || isEmptyDiscovery(discovery)) {
    return (
      <div>
        <h1>{title}</h1>
        <Note type="warning">
          <p>
            Could not load service discovery from Repertoire, so there is no{' '}
            {subject} to show.
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

  return children({
    discovery,
    repertoireUrl,
    refetch: () => {
      void refetch();
    },
    isFetching,
  });
}
