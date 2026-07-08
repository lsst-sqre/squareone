---
'squareone': patch
---

Fix the dark-mode appearance of the squareone token-management and sidebar views by migrating their fixed `--rsd-color-gray-*` scale colors (and two hardcoded hex grays), which are identical in both themes, onto the adaptive `--rsd-component-*` semantic tokens that re-map under `data-theme="dark"` (DM-55433).

The muted/label/secondary text in these ten CSS modules previously rendered near-invisible fixed dark grays on the (adaptive) dark background. Each flagged text `color:` now uses `--rsd-component-text-secondary-color` — muted but legible in both themes — matching the mapping convention this branch established across the notification modules, the shared `DataTable`/`KeyValueList`, and the squared form primitives and `DateTimePicker`:

- `AccessTokensView` `.loading`, `SessionTokensView` `.loading`, `ApiEndpoints` `.notice`, `ServiceTokenForm` `.advancedHint` (a hardcoded `#4b5563`), and `SidebarNavSection` `.label` (a hardcoded `#6b7280`).
- `TokenDetailsView` `.metadataLabel`; and the dark-text-on-fixed-light `.tokenKey` chip is migrated foreground **and** background together (`--rsd-component-text-color` on `--rsd-component-surface-secondary-background-color`) so the code chip adapts instead of staying a fixed light pill.
- `TokenHistoryDetails` `.label`, `.oldValue`, and `.changesHeading`; `TokenHistoryFilters` `.filterLabel`; `TokenHistorySummary` `.time`, `.actor`, and the neutral `.summary.expire .icon` (the create/edit/revoke status hues stay semantic); and `TokenHistoryView` `.loadingState`/`.errorState`/`.emptyState`, `.errorMessage`, and `.totalCount`.

The semantic status hues (`--rsd-color-red-*` errors, the create/edit/revoke action-icon colors) and the Rubin brand-accent `--rsd-color-primary-*` borders are left untouched.

This is the final batch of the migration: it empties the `validate-theme-tokens` baseline (`packages/repo-scripts/src/validate-theme-tokens.baseline.json` is now `{}`), so the guardrail is fully enforcing — every scanned squared + squareone CSS module is on adaptive tokens, and any new fixed dark-color text declaration fails CI. Adds `Dark` Storybook story variants (pinning `globals: { theme: 'dark' }` via the existing `withThemeByDataAttribute` toolbar) to `TokenHistoryDetails`, `TokenHistoryView` (list and error states), `TokenHistoryFilters`, and `TokenDetailsView` so the migrated muted label/timestamp text is visually verifiable in dark mode and can't silently rot.
