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

Migrate the user-facing notification CSS modules (`UserNotifications/UserNotificationsTableView.module.css` and `UserNotifications/UserNotificationDetailView.module.css`) off fixed `--rsd-color-gray-*` scale tokens onto these adaptive tokens, so the `/notifications` list, expanded body, detail page, and empty/loading states are legible in dark mode.

Migrate the admin notification CSS modules (`AdminNotifications/NotificationFilters.module.css`, `AdminNotifications/NotificationsTableView.module.css`, `NotificationDetailView/NotificationDetailView.module.css`, and `NotificationForm/NotificationForm.module.css`) off fixed `--rsd-color-gray-*` scale tokens (and remove the hardcoded hex fallbacks in `NotificationForm.module.css`) onto these adaptive tokens, so the `/admin/notifications` list, filter bar, detail page, and `/admin/notifications/new` compose form are legible in dark mode.

Move the bespoke notification callouts onto the shared squared components so they self-theme in dark mode: the boxed error/not-found states in `NotificationDetailView` and `UserNotificationDetailView` now render via squared `Note` (`type="note"`); the inline load-failure states in both table views and the across-pages bulk-mark-read failure render via squared `ErrorMessage`; and the select-all-across-pages info banner renders via squared `Note` (`type="info"`). This removes the last fixed `--rsd-color-red-*`/`--rsd-color-blue-*` callout tokens (and their now-dead CSS) from the notification modules.

Add a `validate-theme-tokens` guardrail (`packages/repo-scripts/src/validate-theme-tokens.js`, wired into the root `localci` script and CI) that fails when a fixed color-scale token (`color: var(--rsd-color-gray-*|red-*|…)`) or a hardcoded hex is used for text in the notification CSS modules, so the dark-mode migration can't silently rot. The Rubin brand-accent alias `--rsd-color-primary-*` and non-text `background-color` uses are intentionally not flagged; scope is limited to the notification modules.
