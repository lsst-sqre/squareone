---
'@lsst-sqre/squared': patch
---

Add aria-label prop support to Select component

The Select component now accepts an explicit `aria-label` prop to provide custom accessible labels for the select trigger button. When provided, this overrides the automatically generated label from the value/placeholder text.

This improves accessibility for cases where the auto-generated label may not provide sufficient context.
