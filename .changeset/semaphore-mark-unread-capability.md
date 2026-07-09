---
'@lsst-sqre/semaphore-client': minor
---

Add a mark-unread capability mirroring the existing mark-read trio for the Semaphore 2.0 API (DM-55450).

- `markNotificationsUnread(semaphoreUrl, ids, csrfToken)` POSTs `{ ids }` to `POST /v1/notifications/unread` and, like `markNotificationsRead`, is idempotent (already-unread or unknown ids are silently ignored, `204 No Content`) and resolves to `void`. Both named exports now wrap a shared private helper that differs only by the `read`/`unread` path segment; the public API remains two named exports.
- `markNotificationsUnreadMutationOptions` and its `MarkNotificationsUnreadVariables` type perform the same `onSuccess` invalidations as mark-read (the `['user-notifications', url]` list prefix, `['unread-notification-count', url]`, and per-id `['user-notification', url, id]`).
- `useMarkNotificationsUnread` is a thin `useMutation` wrapper, exported alongside `useMarkNotificationsRead`.

Existing function signatures are unchanged.
