---
'@lsst-sqre/squared': minor
---

Add optional controlled row selection to `DataTable`. Providing the new `rowSelection` and `onRowSelectionChange` props opts the table into `@tanstack/react-table`'s row-selection model: a leading checkbox column renders with a select-all header checkbox (indeterminate when only some rows are selected), each row gets its own toggle, and the controlled state stays owned by the caller. Select-all toggles every loaded row. When either prop is omitted the table renders exactly as before, with no checkbox column and no behavior change.
