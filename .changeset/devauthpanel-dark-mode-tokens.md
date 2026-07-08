---
'@lsst-sqre/repo-scripts': patch
'squareone': patch
---

Extend the `validate-theme-tokens` dark-mode guardrail to also scan the squareone App Router pages, and fix the one component it surfaces.

The scanner now recursively scans `apps/squareone/src/app/**/*.module.css` in addition to the two existing `**/components/**` roots (`apps/squareone/src/components` and `packages/squared/src/components`), applying the exact same principled detection rule and exemptions: a text `color:` set to a fixed dark neutral gray-scale token (`--rsd-color-gray-400` … `gray-900`) or a dark hardcoded hex is a violation, while inverted text on a colored/dark background, text a `[data-theme="dark"]` override re-declares, semantic status hues, light gray weights, and the Rubin brand-accent `--rsd-color-primary-*` alias are exempt (DM-55433).

Broadening the scan surfaces exactly one un-migrated module, `apps/squareone/src/app/dev/DevAuthPanel.module.css` (the dev-only auth panel), which is migrated off the fixed `--rsd-color-gray-*` scale onto the adaptive `--rsd-component-*` semantic tokens that re-map under `data-theme="dark"`, matching the mapping convention this branch established across the notification modules and the shared `DataTable`/`KeyValueList`:

- muted/secondary text (`.muted`, `.scopeDescription`, from `gray-600`) → `--rsd-component-text-secondary-color`
- the "Custom" chip (`.customChip`): its dark-on-light-gray foreground AND fixed light background are migrated together (`gray-600` → `--rsd-component-text-secondary-color`, `gray-100` → `--rsd-component-surface-secondary-background-color`) so the chip surface also adapts
- borders (`.personaButton`, `.input`, from `gray-300`) → `--rsd-component-divider-color`
- the semantic "Applied ✓" green (`.applied`) keeps its `--rsd-color-green-600` hue but drops its fixed dark-hex fallback so it no longer trips the hardcoded-hex check

The guardrail baseline remains empty (`{}`) — DevAuthPanel is fixed so it is genuinely clean, not baselined — so the broadened scan passes with 0 known / 0 new violations. Remains wired into the root `localci` script and the CI workflow.
