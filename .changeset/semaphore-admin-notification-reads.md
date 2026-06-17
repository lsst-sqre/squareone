---
'@lsst-sqre/semaphore-client': minor
---

Add the Semaphore admin notifications **read** layer. New Zod schemas (`UserNotificationSchema`, `UserNotificationWithUrlSchema`) and inferred types model the admin list/detail payloads, where `summary` and `body` are raw Markdown. New client functions `fetchAdminNotifications` (parses the RFC 5988 `Link` header for the next cursor and `X-Total-Count` for the total, and applies the `recipient`/`sender`/`since`/`until` filters) and `fetchAdminNotification` back two new TanStack Query option factories (`adminNotificationsInfiniteQueryOptions`, `adminNotificationQueryOptions`) and hooks (`useAdminNotifications` exposing `{ entries, hasMore, loadMore, isLoadingMore, totalCount }`, `useAdminNotification`). A new `mock-notifications` module ships a fixture dataset plus a pure filter+paginate helper for dev API routes and Storybook stories.
