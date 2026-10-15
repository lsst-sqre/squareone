'use client';

import {
  DataTable,
  type DataTableColumnDef,
  TextInput,
} from '@lsst-sqre/squared';
import { BookOpen, FileJson, Search } from 'lucide-react';
import { useId, useState } from 'react';

import { filterServiceRows, type ServiceRow } from '../../lib/admin/overview';
import { TokenScopeBadge } from '../TokenHistory/TokenScopeBadge';
import styles from './AdminOverview.module.css';
import tableStyles from './ServicesTable.module.css';

type ServicesTableProps = {
  /** One row per UI and API service (see `buildServiceRows`). */
  rows: ServiceRow[];
};

const columns: DataTableColumnDef<ServiceRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Service',
    sortFn: 'text',
    cell: (info) => (
      <span className={tableStyles.name}>{info.row.original.name}</span>
    ),
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: 'Kind',
    sortFn: 'text',
    cell: (info) => (
      <span className={tableStyles.kind}>{info.row.original.kind}</span>
    ),
  },
];

/**
 * The detail row beneath a service: its title, its URL beside the scopes it
 * requires, and links to its documentation and OpenAPI specification. Every
 * service has a URL, so a service that discovery describes no further (as
 * under Repertoire 2.x) shows just that.
 */
function ServiceDetail({ row }: { row: ServiceRow }) {
  return (
    <div className={styles.detail}>
      {row.title ? <p className={tableStyles.title}>{row.title}</p> : null}
      <div className={tableStyles.endpoint}>
        <a className={tableStyles.url} href={row.url}>
          {row.url}
        </a>
        {row.requiredScopes.length > 0 ? (
          <ul
            className={tableStyles.scopeList}
            aria-label={`${row.name} required scopes`}
          >
            {row.requiredScopes.map((scope) => (
              <li key={scope}>
                <TokenScopeBadge scope={scope} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {row.docsUrl || row.openapiUrl ? (
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
          {row.openapiUrl ? (
            <li>
              <a
                className={styles.detailLink}
                href={row.openapiUrl}
                aria-label={`${row.name} OpenAPI specification`}
              >
                <FileJson size={16} aria-hidden="true" />
                OpenAPI
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

/** "21 services", or "3 of 21 services" while a filter applies. */
function formatCount(shown: number, total: number): string {
  const noun = total === 1 ? 'service' : 'services';
  return shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`;
}

/**
 * The overview's Services section: every UI and API service in Repertoire
 * service discovery, independent of the Applications list.
 *
 * Each service is a two-row unit: a primary row of its name and kind, which
 * the table sorts by, over a full-width detail row (`ServiceDetail`) with
 * everything else, so URLs wrap within the admin content column rather than
 * widening the table. The filter above the table narrows the rows to the
 * services whose name or title contains the typed text. Without any services,
 * the section says so instead of showing an empty table.
 */
export default function ServicesTable({ rows }: ServicesTableProps) {
  const headingId = useId();
  const [query, setQuery] = useState('');
  const filteredRows = filterServiceRows(rows, query);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>Services</h2>
      {rows.length > 0 ? (
        <>
          <div className={tableStyles.toolbar}>
            <TextInput
              className={tableStyles.filter}
              type="search"
              size="sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by name or title"
              aria-label="Filter services"
              leadingIcon={<Search size={16} aria-hidden="true" />}
            />
            <p className={tableStyles.count} aria-live="polite">
              {formatCount(filteredRows.length, rows.length)}
            </p>
          </div>
          <DataTable
            columns={columns}
            data={filteredRows}
            initialSorting={[{ id: 'name', desc: false }]}
            getRowId={(row) => row.id}
            aria-label="Services"
            emptyContent={`No services match “${query.trim()}”.`}
            renderDetailRow={(row) => <ServiceDetail row={row} />}
          />
        </>
      ) : (
        <p>Service discovery lists no services.</p>
      )}
    </section>
  );
}
