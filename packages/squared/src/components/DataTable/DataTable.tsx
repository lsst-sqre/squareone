'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import styles from './DataTable.module.css';

export type DataTableProps<TData> = {
  /**
   * Column definitions, as TanStack Table `ColumnDef`s.
   *
   * The value type is `any` per column rather than one shared generic, so a
   * heterogeneous set of columns — each with its own accessor value type —
   * can be passed without widening them all to a single type. This is
   * TanStack's idiomatic signature for table wrapper components.
   */
  // biome-ignore lint/suspicious/noExplicitAny: per-column value types; TanStack's idiomatic wrapper signature
  columns: ColumnDef<TData, any>[];
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
  /**
   * Optionally render a full-width secondary row beneath each primary row.
   *
   * When provided, every data item renders as a pair of `<tr>`s inside its
   * own `<tbody>`: the primary row of column cells, followed by a secondary
   * row whose single cell spans all columns (`colSpan`) and holds whatever
   * this returns. The notifications listing uses this to place a rendered
   * Markdown summary full-width beneath its recipient/sender/created row.
   *
   * The detail `colSpan` tracks the leaf column count, so this is
   * forward-compatible with adding a leading expander column for a future
   * expand-to-detail interaction: the secondary slot can swap its content on
   * the row's expanded state without changing this signature's shape.
   *
   * When omitted, each item renders as a single `<tr>` (backward compatible).
   */
  renderDetailRow?: (row: TData) => React.ReactNode;
  /**
   * Controlled row-selection state, keyed by TanStack row id. Providing this
   * together with `onRowSelectionChange` opts the table into row selection: a
   * leading checkbox column and a select-all header checkbox render and drive
   * `@tanstack/react-table`'s row-selection model. When either prop is omitted
   * the table renders exactly as before, with no checkbox column.
   */
  rowSelection?: RowSelectionState;
  /**
   * Invoked when the selection changes (per-row toggle or select-all). Receives
   * TanStack's updater; the caller owns the `rowSelection` state. Required,
   * alongside `rowSelection`, to enable selection.
   */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /**
   * Optionally derive a per-row accessible label for that row's selection
   * checkbox. Without it, every checkbox shares the generic `"Select row"`
   * label, which screen-reader users cannot tell apart. Return a stable,
   * human-readable identifier for the row (e.g. a name or title); it is
   * rendered as `Select row: <identifier>`. Only used when row selection is
   * enabled.
   */
  getRowLabel?: (row: TData) => string;
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

/**
 * The leading checkbox column prepended when row selection is enabled. Its
 * header drives select-all (with an indeterminate state when only some rows
 * are selected) and each cell toggles its own row through TanStack's
 * row-selection model.
 */
function createSelectionColumn<TData>(
  getRowLabel?: (row: TData) => string
): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(value === true)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={
          getRowLabel
            ? `Select row: ${getRowLabel(row.original)}`
            : 'Select row'
        }
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
      />
    ),
  };
}

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
export function DataTable<TData>({
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
  renderDetailRow,
  rowSelection,
  onRowSelectionChange,
  getRowLabel,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  // Selection is opt-in: both the controlled state and its change handler must
  // be supplied. When enabled, prepend the leading checkbox column.
  const selectionEnabled =
    rowSelection !== undefined && onRowSelectionChange !== undefined;

  const tableColumns = React.useMemo(
    () =>
      selectionEnabled
        ? [createSelectionColumn<TData>(getRowLabel), ...columns]
        : columns,
    [selectionEnabled, columns, getRowLabel]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      ...(selectionEnabled ? { rowSelection } : {}),
    },
    onSortingChange: setSorting,
    ...(selectionEnabled
      ? { enableRowSelection: true, onRowSelectionChange }
      : {}),
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
        {rows.length === 0 ? (
          <tbody>
            <tr className={styles.row}>
              <td className={styles.emptyCell} colSpan={columnCount}>
                {emptyContent}
              </td>
            </tr>
          </tbody>
        ) : renderDetailRow ? (
          // Each item is its own <tbody> (multiple tbodies are valid HTML)
          // holding a primary row of cells plus a full-width detail row, so
          // the pair reads as one unit.
          rows.map((row) => (
            <tbody key={row.id} className={styles.rowGroup}>
              <tr className={styles.primaryRow}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.cell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              <tr className={styles.detailRow}>
                <td className={styles.detailCell} colSpan={columnCount}>
                  {renderDetailRow(row.original)}
                </td>
              </tr>
            </tbody>
          ))
        ) : (
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={styles.row}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.cell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
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
