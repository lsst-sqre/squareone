'use client';

import {
  DataTable,
  type DataTableColumnDef,
  TextInput,
} from '@lsst-sqre/squared';
import { Search } from 'lucide-react';
import { useId, useState } from 'react';

import {
  type ApplicationRow,
  filterApplicationRows,
} from '../../lib/admin/overview';
import DocsIconLink from '../DocsIconLink';
import { TokenScopeBadge } from '../TokenHistory/TokenScopeBadge';
import styles from './AdminOverview.module.css';
import tableStyles from './ApplicationsTable.module.css';

type ApplicationsTableProps = {
  /** One row per application (see `buildApplicationRows`). */
  rows: ApplicationRow[];
};

/** Placeholder for a text cell with no value. */
const NONE = '—';

const columns: DataTableColumnDef<ApplicationRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Application',
    sortFn: 'text',
    cell: (info) => (
      <span className={tableStyles.name}>{info.row.original.name}</span>
    ),
  },
  {
    id: 'title',
    // Undefined (rather than null) lets sortUndefined keep untitled
    // applications after the titled ones in either direction.
    accessorFn: (row: ApplicationRow) => row.title ?? undefined,
    header: 'Title',
    sortFn: 'text',
    sortUndefined: 'last',
    cell: (info) => info.row.original.title ?? NONE,
  },
  {
    id: 'kind',
    accessorFn: (row: ApplicationRow) => row.kind ?? undefined,
    header: 'Kind',
    sortFn: 'text',
    sortUndefined: 'last',
    cell: (info) => (
      <span className={tableStyles.kind}>{info.row.original.kind ?? NONE}</span>
    ),
  },
  {
    id: 'urls',
    header: 'URL',
    enableSorting: false,
    cell: ({ row: { original: row } }) =>
      row.urls.length > 0 ? (
        <ul className={tableStyles.urlList}>
          {row.urls.map((serviceUrl) => (
            <li key={serviceUrl.kind} className={tableStyles.urlItem}>
              <span className={tableStyles.urlKind}>{serviceUrl.kind}</span>
              <a className={tableStyles.url} href={serviceUrl.url}>
                {serviceUrl.url}
              </a>
              {/* Name a service joined through an alias, such as nublado's
                  nublado-controller, since it is not the application's name. */}
              {serviceUrl.service !== row.name ? (
                <span className={tableStyles.service}>
                  {serviceUrl.service}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null,
  },
  {
    id: 'docs',
    header: 'Docs',
    enableSorting: false,
    cell: ({ row: { original: row } }) =>
      row.docsUrl ? (
        <DocsIconLink href={row.docsUrl} label={`${row.name} documentation`} />
      ) : null,
  },
  {
    id: 'scopes',
    header: 'Scopes',
    enableSorting: false,
    cell: ({ row: { original: row } }) =>
      row.requiredScopes.length > 0 ? (
        <ul className={tableStyles.scopeList} aria-label="Required scopes">
          {row.requiredScopes.map((scope) => (
            <li key={scope}>
              <TokenScopeBadge scope={scope} />
            </li>
          ))}
        </ul>
      ) : null,
  },
  {
    id: 'openapi',
    header: 'OpenAPI',
    enableSorting: false,
    cell: ({ row: { original: row } }) =>
      row.openapiUrl ? (
        <a
          href={row.openapiUrl}
          aria-label={`${row.name} OpenAPI specification`}
        >
          OpenAPI
        </a>
      ) : null,
  },
];

/** "41 applications", or "3 of 41 applications" while a filter applies. */
function formatCount(shown: number, total: number): string {
  const noun = total === 1 ? 'application' : 'applications';
  return shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`;
}

/**
 * The overview's Applications section: every enabled Phalanx application,
 * joined to the UI and API services it publishes in discovery.
 *
 * The table starts sorted by application name and sorts by name, title, or
 * kind from its column headers. The filter above it narrows the rows to the
 * applications whose name or title contains the typed text.
 */
export default function ApplicationsTable({ rows }: ApplicationsTableProps) {
  const headingId = useId();
  const [query, setQuery] = useState('');
  const filteredRows = filterApplicationRows(rows, query);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>Applications</h2>
      <div className={tableStyles.toolbar}>
        <TextInput
          className={tableStyles.filter}
          type="search"
          size="sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name or title"
          aria-label="Filter applications"
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
        getRowId={(row) => row.name}
        aria-label="Applications"
        emptyContent={
          rows.length === 0
            ? 'Service discovery lists no applications.'
            : `No applications match “${query.trim()}”.`
        }
      />
    </section>
  );
}
