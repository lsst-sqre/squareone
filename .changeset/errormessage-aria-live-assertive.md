---
'@lsst-sqre/squared': patch
---

Fix the shared `ErrorMessage` component so that a caller passing `role="alert"` is announced assertively (interrupting) by assistive technology instead of politely (queued). Previously the component hardcoded `aria-live="polite"` and spread `{...props}` after it, so even when a caller such as the bulk-mark-read failure in `UserNotificationsTableView` supplied `role="alert"`, the explicit `aria-live="polite"` overrode the assertive live-region behavior that `role="alert"` implies. The component now derives `aria-live` from the effective role — `role="alert"` yields `assertive`, the default `role="status"` stays `polite` — while still honoring an explicitly passed `aria-live` prop as the ultimate override. Default behavior is unchanged.
