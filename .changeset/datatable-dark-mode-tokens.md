---
'@lsst-sqre/squared': patch
---

Fix the dark-mode appearance of the shared `DataTable` component by migrating `DataTable.module.css` off the fixed `--rsd-color-gray-*` scale tokens (identical in both themes) onto the adaptive `--rsd-component-*` semantic tokens that re-map under `data-theme="dark"`.

Most visibly, the column headers previously rendered near-black (`--rsd-color-gray-700`) on the dark background — very low contrast on the `/admin/notifications` and `/notifications` pages. They now use `--rsd-component-text-secondary-color` (muted but legible in both themes). The full migration, matching the mapping convention this branch already established across the notification modules:

- muted/secondary text (`.caption`, `.headerCell`, `.sortIconInactive`, `.emptyCell`, from `gray-500`/`gray-700`/`gray-300`) → `--rsd-component-text-secondary-color`
- borders/dividers (`.head`, `.row`, `.rowGroup`, from `gray-100`/`gray-200`) → `--rsd-component-divider-color`
- subtle hover surface (`.sortButton:hover` background, from `gray-50`) → `--rsd-component-surface-secondary-background-color`

The Rubin brand-accent `--rsd-color-primary-*` tokens (sort-button hover/focus text, focus outline, active sort indicator) are intentionally left on their fixed scale, matching the prior notification-module slices. `DataTable` is a shared component, so this corrects dark mode for every consumer. Adds a `Dark` Storybook story variant so the fix is visually verifiable in both themes and can't silently rot.
