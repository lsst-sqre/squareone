# @lsst-sqre/semaphore-client

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
