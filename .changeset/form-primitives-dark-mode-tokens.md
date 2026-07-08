---
'@lsst-sqre/squared': patch
---

Fix the dark-mode appearance of the squared form and menu primitives by migrating their fixed `--rsd-color-gray-*` scale text colors (identical in both themes) onto the adaptive `--rsd-component-*` semantic tokens that re-map under `data-theme="dark"` (DM-55433).

Most visibly, placeholder text, muted field/item descriptions, and trigger chevrons previously rendered near-invisible `--rsd-color-gray-500` on the dark background. They now use `--rsd-component-text-secondary-color` (muted but legible in both themes), matching the mapping convention this branch established across the notification modules and the shared `DataTable`/`KeyValueList`. The migration, by component:

- `Select` — chevron `.icon` and `.trigger[data-placeholder]` placeholder → `--rsd-component-text-secondary-color`
- `TextInput` — `.input::placeholder` and the leading/trailing icons → `--rsd-component-text-secondary-color`
- `TextArea` — `.textarea::placeholder` → `--rsd-component-text-secondary-color`
- `FormField` / `Label` / `Checkbox` / `CheckboxGroup` — the `.description` helper text → `--rsd-component-text-secondary-color`
- `RadioGroup` — the `.itemDescription` per-item helper text → `--rsd-component-text-secondary-color`
- `DropdownMenu` — the trigger chevron `.triggerIcon` and the group `.label` → `--rsd-component-text-secondary-color`
- `Button` — the `.text.secondary` label (a primary text weight, previously `--rsd-color-gray-800`) → `--rsd-component-text-color`

Also migrates `Select`'s hover/chip surfaces together with their foreground so they adapt too: the `.groupLabel` chip (text and its `gray-50` background), the `.scrollButton` muted text plus its hover text and hover background, and the `.item:hover` background → `--rsd-component-text-secondary-color` / `--rsd-component-text-color` / `--rsd-component-surface-secondary-background-color`.

Removes these ten components from the `validate-theme-tokens` baseline (`packages/repo-scripts/src/validate-theme-tokens.baseline.json`), since their flagged text colors are now genuinely adaptive; the guardrail stays green with the reduced baseline. Adds a `Dark` Storybook story variant (pinning `globals: { theme: 'dark' }` via the existing `withThemeByDataAttribute` toolbar) to `Select`, `TextInput`, `TextArea`, `Checkbox`, `RadioGroup`, and `DropdownMenu` so the muted text is visually verifiable in dark mode and can't silently rot. `DateTimePicker` and `TimeInput` remain baselined for a later batch.
