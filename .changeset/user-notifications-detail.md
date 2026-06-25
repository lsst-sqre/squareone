---
'squareone': minor
---

Add the deep-linkable user notification detail page at `/notifications/[id]` behind the `enableUserNotifications` flag. When the flag is off the route returns 404; when on, logged-in users (gated by `AuthRequired`) see the full message — a read-status badge, metadata (id, created, read), and the rendered-Markdown (`gfm`) summary and body — with a "Back to notifications" link, plus loading, terminal-unavailable, error, and 404/not-found states. The new props-driven `UserNotificationDetailView` presentational component carries those states (with a Storybook story per state). Adds the dev mock `GET /api/dev/semaphore/v1/notifications/[id]` returning a single `UserNotificationFormatted` from the persistent user-notifications store (404 for an unknown id); it does not auto-mark the notification read. Display only — auto-mark-read on view is a later slice.
