---
'@lsst-sqre/squared': minor
---

Add a generic `DataTable` component backed by `@tanstack/react-table`. It renders rows from a `data` array using `columns` (`ColumnDef[]`), supports client-side sorting of the currently-loaded rows via sortable column headers, and exposes a caller-owned "Load more" footer for cursor pagination. Because rows arrive in the server's order (created-desc), client-side sorting reorders only the loaded rows rather than performing a global sort across unloaded pages.
