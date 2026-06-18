'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { Button } from '../Button';
import styles from './DataTable.module.css';

export type DataTableProps<TData, TValue = unknown> = {
  /** Column definitions, as TanStack Table `ColumnDef`s. */
  columns: ColumnDef<TData, TValue>[];
  /**
   * The currently-loaded rows.
   *
   * Rows are expected in the server's order — for example an API that
   * returns most-recent-first (created-desc), as the admin notifications
   * UI does. Client-side sorting (below) reorders only these loaded rows,
   * **not** the full server-side result set. See the caveat in the
   * component description.
   */
  data: TData[];
  /** Sort state applied on first render. Defaults to unsorted (server order). */
  initialSorting?: SortingState;
  /**
   * Whether more rows are available from the server. When `true` (and an
   * `onLoadMore` handler is supplied) the "Load more" footer is shown.
   */
  hasMore?: boolean;
  /**
   * Invoked when the user activates "Load more". The caller owns fetching
   * the next page and appending it to `data`; the table never loads data
   * itself.
   */
  onLoadMore?: () => void;
  /**
   * Whether a "Load more" request is currently in flight. Loading is owned
   * by the caller; the table only reflects it on the button.
   */
  isLoadingMore?: boolean;
  /** Label for the "Load more" button. */
  loadMoreLabel?: string;
  /** Content rendered in the table body when there are no rows. */
  emptyContent?: React.ReactNode;
  /** Optional visible caption describing the table. */
  caption?: React.ReactNode;
  /**
   * Accessible label for the table. Used only when there is no visible
   * `caption`; if a `caption` is provided it takes precedence and this is
   * ignored.
   */
  'aria-label'?: string;
  /** Additional class name applied to the wrapper element. */
  className?: string;
};

type SortDirection = false | 'asc' | 'desc';

function SortIndicator({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') {
    return (
      <ChevronUp className={styles.sortIcon} size={16} aria-hidden="true" />
    );
  }
  if (direction === 'desc') {
    return (
      <ChevronDown className={styles.sortIcon} size={16} aria-hidden="true" />
    );
  }
  return (
    <ChevronsUpDown
      className={[styles.sortIcon, styles.sortIconInactive].join(' ')}
      size={16}
      aria-hidden="true"
    />
  );
}

/**
 * A generic, reusable table built on TanStack Table.
 *
 * `DataTable` renders the rows it is given (`data`) using the supplied
 * `columns`, with optional client-side sorting and a caller-owned
 * "Load more" footer for cursor pagination.
 *
 * ## Sorting + cursor pagination caveat
 *
 * Rows arrive in the server's order (for example created-desc, as in the
 * admin notifications UI). Clicking a sortable column header sorts only
 * the **currently-loaded** rows on the client — it does not re-query the
 * server, so it does not produce a globally-sorted result across pages
 * that have not been loaded. "Load more" appends the next cursor page (in
 * server order) and the active client sort is then re-applied to the
 * larger loaded set. This is acceptable for use cases like an admin triage
 * view; it is intentionally not a global sort.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={rows}
 *   hasMore={hasMore}
 *   isLoadingMore={isLoadingMore}
 *   onLoadMore={loadMore}
 * />
 * ```
 */
export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  initialSorting = [],
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  loadMoreLabel = 'Load more',
  emptyContent = 'No data to display.',
  caption,
  'aria-label': ariaLabel,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length || 1;
  const showLoadMore = hasMore && typeof onLoadMore === 'function';

  const wrapperClassName = [styles.wrapper, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName}>
      <table
        className={styles.table}
        aria-label={caption ? undefined : ariaLabel}
      >
        {caption ? (
          <caption className={styles.caption}>{caption}</caption>
        ) : null}
        <thead className={styles.head}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.row}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const ariaSort =
                  sortDirection === 'asc'
                    ? 'ascending'
                    : sortDirection === 'desc'
                      ? 'descending'
                      : canSort
                        ? 'none'
                        : undefined;
                const headerContent = header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    );

                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={styles.headerCell}
                  >
                    {canSort && !header.isPlaceholder ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className={styles.headerLabel}>
                          {headerContent}
                        </span>
                        <SortIndicator direction={sortDirection} />
                      </button>
                    ) : (
                      headerContent
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className={styles.row}>
              <td className={styles.emptyCell} colSpan={columnCount}>
                {emptyContent}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={styles.row}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.cell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showLoadMore ? (
        <div className={styles.footer}>
          <Button
            appearance="outline"
            tone="secondary"
            size="sm"
            onClick={onLoadMore}
            loading={isLoadingMore}
          >
            {loadMoreLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default DataTable;
