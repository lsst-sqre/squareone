---
'squareone': minor
---

Add the `/notifications` inbox page behind the `enableUserNotifications` flag. When the flag is off the route returns 404; when on, logged-in users (gated by `AuthRequired`) see their notifications listed newest-first with date, read status, and a rendered-Markdown (`gfm`) summary, plus a "Show unread only" toggle, "Load more" cursor paging with a total count, and loading/error/empty states. Adds the dev mock `GET /api/dev/semaphore/v1/notifications` honoring `unread`/`cursor`/`limit` with RFC 5988 `Link` + `X-Total-Count`, served from a persistent in-memory user-notifications store. That store replaces the temporary unread-count shim that previously drove the header badge: the badge now reflects the seeded notifications and any later marked read. Read-only in this slice — row selection, mark-read, and the per-message detail view land in later tasks.
