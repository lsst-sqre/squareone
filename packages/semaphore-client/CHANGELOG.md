# @lsst-sqre/semaphore-client

## 0.6.0

### Minor Changes

- [#608](https://github.com/lsst-sqre/squareone/pull/608) [`04c597b`](https://github.com/lsst-sqre/squareone/commit/04c597b4e2d425dc1667d922eb96e4368083fa81) Thanks [@jonathansick](https://github.com/jonathansick)! - Report handled-but-critical broadcast errors to Sentry (DM-55604). The semaphore-client broadcasts `queryFn` now runs through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: it still degrades gracefully to an empty broadcasts list on any failure, but report-worthy failures (a `ZodError` from API contract drift — the DM-55599 scenario — a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected auth failures (401/403) stay quiet. The squareone app supplies that hook via a new `makeReportError` in `src/lib/sentry/`, which calls `Sentry.captureException` with site/package context tags and is guarded by an in-memory dedupe window (once per session client-side, once per ~15-minute window server-side) so 60 s polling cannot flood Sentry during an outage. It is wired at both broadcast call sites: the `layout.tsx` RSC prefetch and the client-side `BroadcastBannerStack`. `@lsst-sqre/semaphore-client` now re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling.

### Patch Changes

- [#597](https://github.com/lsst-sqre/squareone/pull/597) [`3d29d31`](https://github.com/lsst-sqre/squareone/commit/3d29d3107d17a75d8f4fba5cce3a0c82ef520a6a) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix broadcast parsing for broadcasts with a null body (DM-55599). The Semaphore API always includes the `body` field and sends `null` when a broadcast has no body content, but the zod `BroadcastSchema` only allowed the field to be omitted, so any broadcast with a null body failed parsing and no broadcasts were displayed. The schema now accepts a null (or omitted) body, and the broadcast banner omits the "Show more" disclosure button when there is no body to disclose. Also refreshed the Semaphore `openapi.json` to the current production schema (2.0.0).

- Updated dependencies [[`e41ac1f`](https://github.com/lsst-sqre/squareone/commit/e41ac1f152655e3241a44726dd79560d427ce967)]:
  - @lsst-sqre/api-client-core@0.2.0

## 0.5.0

### Minor Changes

- [#549](https://github.com/lsst-sqre/squareone/pull/549) [`13ffc56`](https://github.com/lsst-sqre/squareone/commit/13ffc56a5ff7ddd5c26205dde0ff92410bd71776) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a mark-unread capability mirroring the existing mark-read trio for the Semaphore 2.0 API (DM-55450).

  - `markNotificationsUnread(semaphoreUrl, ids, csrfToken)` POSTs `{ ids }` to `POST /v1/notifications/unread` and, like `markNotificationsRead`, is idempotent (already-unread or unknown ids are silently ignored, `204 No Content`) and resolves to `void`. Both named exports now wrap a shared private helper that differs only by the `read`/`unread` path segment; the public API remains two named exports.
  - `markNotificationsUnreadMutationOptions` and its `MarkNotificationsUnreadVariables` type perform the same `onSuccess` invalidations as mark-read (the `['user-notifications', url]` list prefix, `['unread-notification-count', url]`, and per-id `['user-notification', url, id]`).
  - `useMarkNotificationsUnread` is a thin `useMutation` wrapper, exported alongside `useMarkNotificationsRead`.

  Existing function signatures are unchanged.

## 0.4.0

### Minor Changes

- [#507](https://github.com/lsst-sqre/squareone/pull/507) [`79cea8a`](https://github.com/lsst-sqre/squareone/commit/79cea8a96fa82e3155679c73ec7b5d3c0acdad82) Thanks [@jonathansick](https://github.com/jonathansick)! - Add the Semaphore user-facing notifications surface, parallel to the admin one. New Zod schemas `UserNotificationSummarySchema` and `UserNotificationFormattedSchema` (reusing `FormattedTextSchema`) model the user list/detail payloads, where `summary`/`body` are pre-rendered `{ gfm, html }` rather than raw Markdown. New client functions `fetchUserNotifications` (applies `unread`/`limit`/`cursor`, parses the RFC 5988 `Link` cursor and `X-Total-Count`), `fetchUserNotification`, and `markNotificationsRead` (`POST /v1/notifications/read` with the CSRF header; 204 is success) back new TanStack Query option factories (`userNotificationsInfiniteQueryOptions`, `userNotificationQueryOptions`, `unreadNotificationCountQueryOptions`) and a `markNotificationsReadMutationOptions` whose `onSuccess` invalidates the user lists, the unread count, and each affected detail. New hooks `useUserNotifications`, `useUserNotification`, `useUnreadNotificationCount` (with a configurable background poll), and `useMarkNotificationsRead` wrap them. The `mock-notifications` module gains user-facing fixtures in the `FormattedText` shape plus `filterAndPaginateUserNotifications` and a generic `markUserNotificationsRead` helper for dev routes and Storybook.

## 0.3.0

### Minor Changes

- [#484](https://github.com/lsst-sqre/squareone/pull/484) [`8e195f6`](https://github.com/lsst-sqre/squareone/commit/8e195f67230bb1c056f52cb738685e8c3c9881a5) Thanks [@jonathansick](https://github.com/jonathansick)! - Add the Semaphore admin notifications **create** layer. A new Zod schema (`CreateUserNotificationSchema`) and inferred `CreateUserNotification` type model the `{ recipient, summary, body? }` create payload. The client function `createAdminNotification(semaphoreUrl, notification, csrfToken)` POSTs to `/v1/admin/notifications` with `credentials: 'include'` and the Gafaelfawr `x-csrf-token` header, returning the created `UserNotificationWithUrl`. A new `mutation-options` module ships `createAdminNotificationMutationOptions` (and the `CreateAdminNotificationVariables` type), whose `onSuccess` invalidates the admin-notifications list query, and the `useCreateAdminNotification(semaphoreUrl)` hook exposes the create mutation.

- [#484](https://github.com/lsst-sqre/squareone/pull/484) [`2933281`](https://github.com/lsst-sqre/squareone/commit/29332819e44dcea79e67dd99f98b247c5885f278) Thanks [@jonathansick](https://github.com/jonathansick)! - Add the Semaphore admin notifications **read** layer. New Zod schemas (`UserNotificationSchema`, `UserNotificationWithUrlSchema`) and inferred types model the admin list/detail payloads, where `summary` and `body` are raw Markdown. New client functions `fetchAdminNotifications` (parses the RFC 5988 `Link` header for the next cursor and `X-Total-Count` for the total, and applies the `recipient`/`sender`/`since`/`until` filters) and `fetchAdminNotification` back two new TanStack Query option factories (`adminNotificationsInfiniteQueryOptions`, `adminNotificationQueryOptions`) and hooks (`useAdminNotifications` exposing `{ entries, hasMore, loadMore, isLoadingMore, totalCount }`, `useAdminNotification`). A new `mock-notifications` module ships a fixture dataset plus a pure filter+paginate helper for dev API routes and Storybook stories.

## 0.2.0

### Minor Changes

- [#383](https://github.com/lsst-sqre/squareone/pull/383) [`0a774e8`](https://github.com/lsst-sqre/squareone/commit/0a774e80f3529d1edd845144b853caecc3864743) Thanks [@jonathansick](https://github.com/jonathansick)! - Add @lsst-sqre/semaphore-client package

  New package providing a typed client for the Semaphore broadcast API:

  - Zod schemas for broadcast message validation
  - `SemaphoreClient` class for fetching broadcasts
  - `useBroadcasts` React Query hook with prefetch support via query option factories
  - Mock broadcast data for testing and development
  - ESLint configuration and vitest test suite

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add optional structured logger injection to client packages

  - Added a `Logger` type to each client package (`repertoire-client`, `semaphore-client`, `gafaelfawr-client`, `times-square-client`) matching pino's `(obj, msg)` calling convention
  - All `console.log`, `console.error`, and `console.warn` calls replaced with structured logger calls using `debug`, `error`, and `warn` levels
  - Logger is accepted as an optional parameter; when omitted, a console-based default preserves existing behavior for client-side and test usage
  - squareone's server-side layout now passes its pino logger to `discoveryQueryOptions`, `fetchServiceDiscovery`, and `broadcastsQueryOptions` for structured JSON output on GKE
