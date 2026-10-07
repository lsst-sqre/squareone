'use client';

import {
  Badge,
  ClipboardButton,
  DataTable,
  type DataTableColumnDef,
  KeyValueList,
} from '@lsst-sqre/squared';
import { useId } from 'react';

import type { InfluxRow } from '../../lib/admin/overview';
import styles from './AdminOverview.module.css';
import tableStyles from './InfluxTable.module.css';

type InfluxTableProps = {
  /** One row per InfluxDB database (see `buildInfluxRows`). */
  rows: InfluxRow[];
};

const columns: DataTableColumnDef<InfluxRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    sortFn: 'text',
    cell: ({ row: { original: row } }) => (
      <span className={tableStyles.nameCell}>
        <span className={tableStyles.name}>{row.name}</span>
        {row.local ? (
          <Badge
            variant="soft"
            color="green"
            radius="full"
            size="sm"
            title="Local to this environment"
          >
            local
          </Badge>
        ) : null}
      </span>
    ),
  },
];

/**
 * The detail row beneath a database: its name within the InfluxDB server, the
 * server's URL, the schema registry, and the credentials URL, as key-value
 * pairs. The URLs are usually cluster-internal, so they are shown as text
 * rather than links; the credentials URL has a button to copy it.
 */
function InfluxDetail({ row }: { row: InfluxRow }) {
  return (
    <KeyValueList
      className={tableStyles.details}
      items={[
        {
          key: 'Database',
          value: <code className={tableStyles.code}>{row.database}</code>,
        },
        {
          key: 'URL',
          value: <code className={tableStyles.code}>{row.url}</code>,
        },
        {
          key: 'Schema registry',
          value: (
            <code className={tableStyles.code}>{row.schemaRegistryUrl}</code>
          ),
        },
        {
          key: 'Credentials URL',
          // Text to copy, not a link: the overview never fetches credentials.
          value: (
            <span className={tableStyles.copyable}>
              <code className={tableStyles.code}>{row.credentialsUrl}</code>
              <ClipboardButton
                text={row.credentialsUrl}
                label=""
                successLabel=""
                ariaLabel={`Copy the ${row.name} credentials URL to the clipboard`}
                size="sm"
                appearance="text"
                tone="secondary"
                className={tableStyles.copyButton}
              />
            </span>
          ),
        },
      ]}
    />
  );
}

/**
 * The overview's InfluxDB databases section: each database that discovery
 * describes, flagged when it is local to this environment.
 *
 * Each database is a two-row unit: a primary row of its name, which the table
 * sorts by, over a full-width detail row (`InfluxDetail`) listing its
 * database, URLs, and credentials URL, with a button to copy the latter for
 * use with an authenticated client; the overview never fetches the
 * credentials. Without any databases, the section says so instead of showing
 * an empty table.
 */
export default function InfluxTable({ rows }: InfluxTableProps) {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>InfluxDB databases</h2>
      {rows.length > 0 ? (
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.name}
          aria-label="InfluxDB databases"
          renderDetailRow={(row) => <InfluxDetail row={row} />}
        />
      ) : (
        <p>Service discovery lists no InfluxDB databases.</p>
      )}
    </section>
  );
}
