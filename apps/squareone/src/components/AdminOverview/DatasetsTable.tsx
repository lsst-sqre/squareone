'use client';

import { DataTable, type DataTableColumnDef } from '@lsst-sqre/squared';
import { useId } from 'react';

import type { DatasetRow } from '../../lib/admin/overview';
import DocsIconLink from '../DocsIconLink';
import styles from './AdminOverview.module.css';
import tableStyles from './DatasetsTable.module.css';

type DatasetsTableProps = {
  /** One row per dataset (see `buildDatasetRows`). */
  rows: DatasetRow[];
};

/** Placeholder for a cell with no value. */
const NONE = '—';

/**
 * A link to one of a dataset's configuration files, named for the dataset so
 * that each row's link is distinct. The file's URL is its tooltip.
 */
function ConfigLink({
  dataset,
  label,
  url,
}: {
  dataset: string;
  label: string;
  url: string | null;
}) {
  if (!url) return NONE;
  return (
    <a
      className={tableStyles.configLink}
      href={url}
      title={url}
      aria-label={`${dataset} ${label}`}
    >
      {label}
    </a>
  );
}

const columns: DataTableColumnDef<DatasetRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Dataset',
    sortFn: 'text',
    cell: (info) => (
      <span className={tableStyles.name}>{info.row.original.name}</span>
    ),
  },
  {
    id: 'description',
    header: 'Description',
    enableSorting: false,
    cell: (info) => (
      <span className={tableStyles.description}>
        {info.row.original.description ?? NONE}
      </span>
    ),
  },
  {
    id: 'docs',
    header: 'Docs',
    enableSorting: false,
    cell: ({ row: { original: row } }) =>
      row.docsUrl ? (
        <DocsIconLink href={row.docsUrl} label={`${row.name} documentation`} />
      ) : (
        NONE
      ),
  },
  {
    id: 'butler',
    header: 'Butler',
    enableSorting: false,
    cell: ({ row: { original: row } }) => (
      <ConfigLink
        dataset={row.name}
        label="Butler config"
        url={row.butlerConfigUrl}
      />
    ),
  },
  {
    id: 'obscore',
    header: 'ObsCore',
    enableSorting: false,
    cell: ({ row: { original: row } }) => (
      <ConfigLink
        dataset={row.name}
        label="ObsCore config"
        url={row.obscoreConfigUrl}
      />
    ),
  },
  {
    id: 'services',
    header: 'Services',
    enableSorting: false,
    cell: ({ row: { original: row } }) =>
      row.services.length > 0 ? (
        <ul
          className={tableStyles.serviceList}
          aria-label={`${row.name} services`}
        >
          {row.services.map((service) => (
            <li key={service} className={tableStyles.service}>
              {service}
            </li>
          ))}
        </ul>
      ) : (
        NONE
      ),
  },
];

/**
 * The overview's Datasets section: each dataset that discovery describes,
 * with links to its documentation and its Butler and ObsCore configurations,
 * and the data services it exposes.
 *
 * Rows keep discovery's order until a column header sorts them. Without any
 * datasets, the section says so instead of showing an empty table.
 */
export default function DatasetsTable({ rows }: DatasetsTableProps) {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>Datasets</h2>
      {rows.length > 0 ? (
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.name}
          aria-label="Datasets"
        />
      ) : (
        <p>Service discovery lists no datasets.</p>
      )}
    </section>
  );
}
