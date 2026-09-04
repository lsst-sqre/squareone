---
"@lsst-sqre/squared": minor
"squareone": patch
---

DataTable columns can now opt into right alignment via the column def's `meta: { align: 'right' }`, which right-aligns both the header (including its sort button's label and indicator) and the column's body cells. Useful for numeric or timestamp columns whose values compare down the column. The OIDC clients admin table uses it to anchor its "Last modified" column to the table's trailing edge.
