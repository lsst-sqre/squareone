# @lsst-sqre/semaphore-client

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
