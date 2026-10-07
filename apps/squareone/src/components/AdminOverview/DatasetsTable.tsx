'use client';

import { DataTable, type DataTableColumnDef } from '@lsst-sqre/squared';
import { BookOpen, FileCog } from 'lucide-react';
import { useId } from 'react';

import type { DatasetRow } from '../../lib/admin/overview';
import styles from './AdminOverview.module.css';
import tableStyles from './DatasetsTable.module.css';

type DatasetsTableProps = {
  /** One row per dataset (see `buildDatasetRows`). */
  rows: DatasetRow[];
};

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
];

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
  url: string;
}) {
  return (
    <a
      className={styles.detailLink}
      href={url}
      title={url}
      aria-label={`${dataset} ${label}`}
    >
      <FileCog size={16} aria-hidden="true" />
      {label}
    </a>
  );
}

/**
 * The detail row beneath a dataset: its description, the data services it
 * exposes, and links to its documentation and its Butler and ObsCore
 * configuration files.
 */
function DatasetDetail({ row }: { row: DatasetRow }) {
  const hasLinks = Boolean(
    row.docsUrl || row.butlerConfigUrl || row.obscoreConfigUrl
  );
  if (!row.description && row.services.length === 0 && !hasLinks) {
    return (
      <p className={styles.detailEmpty}>
        Service discovery describes nothing more about this dataset.
      </p>
    );
  }

  return (
    <div className={styles.detail}>
      {row.description ? (
        <p className={tableStyles.description}>{row.description}</p>
      ) : null}
      {row.services.length > 0 ? (
        <div className={tableStyles.services}>
          <span className={tableStyles.servicesLabel}>Services</span>
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
        </div>
      ) : null}
      {hasLinks ? (
        <ul className={styles.detailLinks}>
          {row.docsUrl ? (
            <li>
              <a
                className={styles.detailLink}
                href={row.docsUrl}
                aria-label={`${row.name} documentation`}
              >
                <BookOpen size={16} aria-hidden="true" />
                Documentation
              </a>
            </li>
          ) : null}
          {row.butlerConfigUrl ? (
            <li>
              <ConfigLink
                dataset={row.name}
                label="Butler config"
                url={row.butlerConfigUrl}
              />
            </li>
          ) : null}
          {row.obscoreConfigUrl ? (
            <li>
              <ConfigLink
                dataset={row.name}
                label="ObsCore config"
                url={row.obscoreConfigUrl}
              />
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * The overview's Datasets section: each dataset that discovery describes,
 * with its description, the data services it exposes, and links to its
 * documentation and its Butler and ObsCore configurations.
 *
 * Each dataset is a two-row unit: a primary row of just its key, which the
 * table sorts by, over a full-width detail row (`DatasetDetail`) with the
 * rest. Rows keep discovery's order until the header sorts them. Without any
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
          renderDetailRow={(row) => <DatasetDetail row={row} />}
        />
      ) : (
        <p>Service discovery lists no datasets.</p>
      )}
    </section>
  );
}
