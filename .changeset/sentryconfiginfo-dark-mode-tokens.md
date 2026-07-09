---
'squareone': patch
---

Fix the dark-mode appearance of the app-local `SentryConfigInfo` component (the `/admin/sentry` config list) by migrating the `.label` (`<dt>`) text color in `SentryConfigInfo.module.css` off the fixed `--rsd-color-gray-500` scale token (identical in both themes) onto the adaptive `--rsd-component-text-secondary-color` semantic token that re-maps under `data-theme="dark"`.

The "Status", "Environment", sample-rate, and "Base URL" labels previously rendered near-invisible `--rsd-color-gray-500` on the dark background. They now use `--rsd-component-text-secondary-color` (muted but legible in both themes), matching the mapping convention this branch established across the notification modules and the shared `DataTable`/`KeyValueList`. Adds a `Dark` Storybook story variant so the fix is visually verifiable in both themes and can't silently rot.
