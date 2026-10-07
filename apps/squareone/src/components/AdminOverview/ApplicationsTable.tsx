'use client';

import {
  DataTable,
  type DataTableColumnDef,
  TextInput,
} from '@lsst-sqre/squared';
import { BookOpen, FileJson, Search } from 'lucide-react';
import { useId, useState } from 'react';

import {
  type ApplicationRow,
  filterApplicationRows,
} from '../../lib/admin/overview';
import { TokenScopeBadge } from '../TokenHistory/TokenScopeBadge';
import styles from './AdminOverview.module.css';
import tableStyles from './ApplicationsTable.module.css';

type ApplicationsTableProps = {
  /** One row per application (see `buildApplicationRows`). */
  rows: ApplicationRow[];
};

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
];

/**
 * The detail row beneath an application: its title, each service it
 * publishes with that service's URL and required scopes side by side, and
 * links to its documentation and OpenAPI specification.
 */
function ApplicationDetail({ row }: { row: ApplicationRow }) {
  if (row.services.length === 0 && !row.title && !row.docsUrl) {
    return (
      <p className={styles.detailEmpty}>
        No UI or API service in service discovery.
      </p>
    );
  }

  return (
    <div className={styles.detail}>
      {row.title ? <p className={tableStyles.title}>{row.title}</p> : null}
      {row.services.length > 0 ? (
        <ul
          className={tableStyles.serviceList}
          aria-label={`${row.name} services`}
        >
          {row.services.map((service) => (
            <li key={service.kind} className={tableStyles.service}>
              <span className={tableStyles.serviceKind}>{service.kind}</span>
              <span className={tableStyles.serviceUrl}>
                <a className={tableStyles.url} href={service.url}>
                  {service.url}
                </a>
                {/* Name a service joined through an alias, such as nublado's
                    nublado-controller, since it is not the application's
                    name. */}
                {service.service !== row.name ? (
                  <span className={tableStyles.serviceName}>
                    {service.service}
                  </span>
                ) : null}
              </span>
              {service.requiredScopes.length > 0 ? (
                <ul
                  className={tableStyles.scopeList}
                  aria-label={`${service.service} required scopes`}
                >
                  {service.requiredScopes.map((scope) => (
                    <li key={scope}>
                      <TokenScopeBadge scope={scope} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
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

/** "41 applications", or "3 of 41 applications" while a filter applies. */
function formatCount(shown: number, total: number): string {
  const noun = total === 1 ? 'application' : 'applications';
  return shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`;
}

/**
 * The overview's Applications section: every enabled Phalanx application,
 * joined to the UI and API services it publishes in discovery.
 *
 * Each application is a two-row unit: a primary row of just its name, which
 * the table sorts by, over a full-width detail row (`ApplicationDetail`) with
 * everything else, so service URLs wrap within the admin content column
 * rather than widening the table. The filter above the table narrows the
 * rows to the applications whose name or title contains the typed text.
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
        renderDetailRow={(row) => <ApplicationDetail row={row} />}
      />
    </section>
  );
}
