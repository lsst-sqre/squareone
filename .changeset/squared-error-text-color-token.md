---
'@lsst-sqre/squared': patch
---

Fix the error-state text color in `TextInput`, `TextArea`, and `Select`. Their error variants set `color: var(--rsd-color-red-900)`, but rubin-style-dictionary's red scale ends at 800, so the custom property was undefined, the declaration was dropped, and error text rendered in the inherited body color instead of red. They now use `--rsd-color-red-600` ("Dark red for solid backgrounds and text"), matching the `--rsd-color-red-500` border those variants already carry.
