---
"squareone": patch
---

Reorder the admin sidebar navigation so User notifications comes first and Sentry last (User notifications, Service tokens, Sentry). Because the `/admin` index redirects to the first navigation item, `/admin` now lands on `/admin/notifications` instead of `/admin/sentry`.
