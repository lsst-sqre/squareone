import type { OIDCClient } from '@lsst-sqre/gafaelfawr-client';
import {
  Button,
  DataTable,
  type DataTableProps,
  KeyValueList,
} from '@lsst-sqre/squared';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { formatUtcTimestamp } from '../../lib/utils/dateFormatters';
import styles from './OIDCClientsTable.module.css';

/** Base path for the admin OpenID Connect client routes. */
const OIDC_CLIENTS_BASE_HREF = '/admin/oidc-clients';

/** Where the "New client" button links by default. */
const DEFAULT_NEW_CLIENT_HREF = `${OIDC_CLIENTS_BASE_HREF}/new`;

export type OIDCClientsTableProps = {
  /** The registered OpenID Connect clients, in the order Gafaelfawr returned. */
  clients: OIDCClient[];
  /** Override the "New client" button target (defaults to the create route). */
  newClientHref?: string;
};

const columns: DataTableProps<OIDCClient>['columns'] = [
  {
    accessorKey: 'description',
    header: 'Description',
    // The description is the client's human-readable name, so it carries the
    // link to the detail page rather than the opaque client id below it.
    cell: (info) => (
      <Link
        href={`${OIDC_CLIENTS_BASE_HREF}/${encodeURIComponent(
          info.row.original.client_id
        )}`}
        className={styles.descriptionLink}
      >
        {info.getValue<string>()}
      </Link>
    ),
  },
  {
    accessorKey: 'last_modified',
    header: 'Last modified',
    cell: (info) => formatUtcTimestamp(info.getValue<string>()),
  },
  { accessorKey: 'last_modified_by', header: 'Last modified by' },
];

/**
 * Presentational listing of a deployment's OpenID Connect clients.
 *
 * Each client is a two-row unit, following the admin notifications listing: a
 * primary row of the description (linking to that client's detail page) with
 * who last modified it when, and a full-width secondary row carrying the
 * client's `client_id` and `return_uri`. Those two are long, opaque, and
 * copy-pasted rather than scanned, so as columns they would either shred
 * mid-token or push the table wider than the admin content column; beneath the
 * row they stay whole and the sortable columns stay readable.
 *
 * Sorting is over the whole collection: Gafaelfawr returns every client in one
 * response, so there is no unloaded page for a client-side sort to miss.
 *
 * The component is fully driven by props so Storybook can exercise it against
 * fixtures. It deliberately knows nothing about loading or failure: fetching
 * lives in the container, which renders its own not-configured, unauthorized,
 * and retryable-error states in place of this table — none of which should
 * offer a "New client" button. The one state that *is* the table's is the
 * empty one, where that button is the whole point of the page.
 */
export default function OIDCClientsTable({
  clients,
  newClientHref = DEFAULT_NEW_CLIENT_HREF,
}: OIDCClientsTableProps) {
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button
          as={Link}
          href={newClientHref}
          leadingIcon={PlusCircle}
          size="sm"
        >
          New client
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        aria-label="OpenID Connect clients"
        emptyContent="No OpenID Connect clients are registered in this environment yet."
        renderDetailRow={(client) => (
          <KeyValueList
            className={styles.identifiers}
            items={[
              {
                key: 'Client ID',
                value: <code className={styles.mono}>{client.client_id}</code>,
              },
              {
                key: 'Return URI',
                value: <code className={styles.mono}>{client.return_uri}</code>,
              },
            ]}
          />
        )}
      />
    </div>
  );
}
