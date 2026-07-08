---
'@lsst-sqre/rubin-style-dictionary': minor
'squareone': patch
---

Add three adaptive `--rsd-component-*` semantic theme tokens that re-map under dark mode (via `tokens.dark.css`), and repair three pre-existing dangling `--sqo-*` references.

New tokens (authored as `themed: {light, dark}` YAML in `rubin-style-dictionary`, so they regenerate into both `tokens.css` and `tokens.dark.css`):

- `--rsd-component-text-secondary-color` — muted/secondary text (light `gray-600`, dark `gray-300`).
- `--rsd-component-divider-color` — borders and dividers (light `gray-200`, dark `gray-700`).
- `--rsd-component-surface-secondary-background-color` — subtle surfaces such as hover/selected rows and the inline code chip (light `gray-100`, dark `gray-700`).

Repoint the three dangling refs at the new secondary-text token so muted text renders adaptively in both themes instead of silently falling back to inherited body color: `--sqo-color-text-secondary` in `AdminRequired.module.css` and `AuthRequired.module.css`, and `--sqo-text-muted` in `app/error.tsx`. Dark-gray weights are the starting values; exact tuning is deferred to the dark-mode visual-QA step.
