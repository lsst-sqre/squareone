'use client';

import {
  Badge,
  ClipboardButton,
  DataTable,
  type DataTableColumnDef,
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
  {
    id: 'database',
    accessorKey: 'database',
    header: 'Database',
    sortFn: 'text',
    cell: (info) => (
      <code className={tableStyles.code}>{info.row.original.database}</code>
    ),
  },
  {
    id: 'url',
    header: 'URL',
    enableSorting: false,
    cell: (info) => (
      <code className={tableStyles.code}>{info.row.original.url}</code>
    ),
  },
  {
    id: 'schemaRegistry',
    header: 'Schema registry',
    enableSorting: false,
    // Usually a cluster-internal URL, so shown as text rather than a link.
    cell: (info) => (
      <code className={tableStyles.code}>
        {info.row.original.schemaRegistryUrl}
      </code>
    ),
  },
  {
    id: 'credentials',
    header: 'Credentials URL',
    enableSorting: false,
    // Text to copy, not a link: the overview never fetches credentials.
    cell: ({ row: { original: row } }) => (
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
];

/**
 * The overview's InfluxDB databases section: each database that discovery
 * describes, flagged when it is local to this environment.
 *
 * The credentials URL is shown with a button to copy it, for use with an
 * authenticated client; the overview never fetches the credentials. Without
 * any databases, the section says so instead of showing an empty table.
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
        />
      ) : (
        <p>Service discovery lists no InfluxDB databases.</p>
      )}
    </section>
  );
}
