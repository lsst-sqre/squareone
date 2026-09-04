import type { OIDCClient } from '@lsst-sqre/gafaelfawr-client';
import { Button, DataTable, type DataTableProps } from '@lsst-sqre/squared';
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
    accessorKey: 'client_id',
    header: 'Client ID',
    // The client id is what an admin looks a row up by, so it is the row's
    // title and carries the link to the detail page.
    cell: (info) => (
      <Link
        href={`${OIDC_CLIENTS_BASE_HREF}/${encodeURIComponent(
          info.getValue<string>()
        )}`}
        className={styles.clientIdLink}
      >
        {info.getValue<string>()}
      </Link>
    ),
  },
  {
    accessorKey: 'last_modified',
    header: 'Last modified',
    cell: (info) => formatUtcTimestamp(info.getValue<string>()),
    // With only two columns, the timestamp reads more naturally anchored to
    // the table's trailing edge than floating mid-row after the client id.
    meta: { align: 'right' },
  },
];

/**
 * Presentational listing of a deployment's OpenID Connect clients.
 *
 * Each client is a two-row unit, following the admin notifications listing: a
 * primary row of the `client_id` (linking to that client's detail page) and
 * when the client last changed, over a full-width addendum row carrying the
 * description and `return_uri` as prose. The client id leads because it is the
 * value an admin arrives with — from a Phalanx values file, a Gafaelfawr log
 * line, or a failing redirect — and so is what they scan the column for; the
 * description explains a row once it has been found, and reads better as a
 * sentence beneath it than squeezed into a column. Keeping the id and the URI
 * in the mono face, wrapping rather than truncating, lets both stay whole
 * without pushing the table past the admin content column.
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
          <div className={styles.details}>
            <p className={styles.description}>{client.description}</p>
            <code className={styles.returnUri}>{client.return_uri}</code>
          </div>
        )}
      />
    </div>
  );
}
