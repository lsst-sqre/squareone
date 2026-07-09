---
'@lsst-sqre/squared': patch
---

Fix the dark-mode appearance of the shared `KeyValueList` component by migrating the `.term` (key/label) text color in `KeyValueList.module.css` off the fixed `--rsd-color-gray-500` scale token (identical in both themes) onto the adaptive `--rsd-component-text-secondary-color` semantic token that re-maps under `data-theme="dark"`.

The term labels previously rendered near-invisible `--rsd-color-gray-500` on the dark background — most visibly the "CPU", "Memory", etc. labels on `/settings/quotas`, which renders via the app's `QuotasView`. They now use `--rsd-component-text-secondary-color` (muted but legible in both themes), matching the mapping convention this branch established across the notification modules and the shared `DataTable`. `KeyValueList` is a shared component, so this corrects dark mode for every consumer. Adds a `Dark` Storybook story variant so the fix is visually verifiable in both themes and can't silently rot.
