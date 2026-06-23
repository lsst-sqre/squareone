---
'@lsst-sqre/squared': minor
'squareone': patch
---

Add an optional `renderDetailRow` prop to `DataTable`. When provided, each data item renders as a two-row unit: the primary row of column cells, plus a full-width secondary row beneath it whose single cell spans every column. The detail `colSpan` tracks the leaf column count, leaving a clean path to a future expand-to-detail interaction with a dedicated expander column.

The squareone admin notifications listing (`/admin/notifications`) uses this for a two-row layout: the sortable recipient, sender, and created columns now get the full table width (no more truncated headers), and the rendered-Markdown summary spans full-width beneath each row instead of competing for a column.
