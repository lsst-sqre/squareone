---
"@lsst-sqre/semaphore-client": minor
---

Add @lsst-sqre/semaphore-client package

New package providing a typed client for the Semaphore broadcast API:

- Zod schemas for broadcast message validation
- `SemaphoreClient` class for fetching broadcasts
- `useBroadcasts` React Query hook with prefetch support via query option factories
- Mock broadcast data for testing and development
- ESLint configuration and vitest test suite
