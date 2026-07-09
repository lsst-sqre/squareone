---
'squareone': patch
---

Use the `warning` variant of the shared squared `Note` for the notification error/not-found callouts. The admin `NotificationDetailView` and user `UserNotificationDetailView` error/not-found states previously rendered with `type="note"`, which printed the literal badge "Note" above genuine error messages like "Notification not found" / "Error loading notification". They now use `type="warning"`, so the badge reads "Warning" (orange) — an appropriate label and color for a recoverable error/not-found state.
