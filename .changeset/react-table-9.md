---
'@lsst-sqre/squared': minor
---

Update @tanstack/react-table from 8 to 9. `DataTable` now builds on the v9 `useTable` hook with an explicit feature bundle (row sorting and row selection) and types its column `meta` per table instead of augmenting TanStack's `ColumnMeta` globally. The `columns` prop is now typed as the new exported `DataTableColumnDef<TData>`, which consumers should use in place of TanStack's `ColumnDef<TData>` when declaring columns; `DataTableProps<TData>['columns']` continues to work. Row data must be an object or array (`RowData`), matching TanStack's tightened constraint.
