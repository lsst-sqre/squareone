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
