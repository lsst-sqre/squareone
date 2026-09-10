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
    accessorKey: 'description',
    header: 'Description',
    // The description is what an admin recognizes a client by — "Argo CD",
    // "Chronograf dashboards" — so it is the row's title and carries the
    // link to the detail page, where the client id lives.
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
    // With only two columns, the timestamp reads more naturally anchored to
    // the table's trailing edge than floating mid-row after the description.
    meta: { align: 'right' },
  },
];

/**
 * Presentational listing of a deployment's OpenID Connect clients.
 *
 * Each client is a two-row unit, following the admin notifications listing: a
 * primary row of the description (linking to that client's detail page) and
 * when the client last changed, over a full-width addendum row carrying the
 * `return_uri`. The description leads because it is how an admin recognizes a
 * client — "Argo CD", "Chronograf dashboards" — and so is what they scan the
 * column for. The opaque `client_id` is deliberately not shown here: it is
 * only meaningful when copying it into a values file or matching it against a
 * log line, and the detail page presents it for that. Keeping the URI in the
 * mono face, wrapping rather than truncating, lets it stay whole without
 * pushing the table past the admin content column.
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
          <code className={styles.returnUri}>{client.return_uri}</code>
        )}
      />
    </div>
  );
}
