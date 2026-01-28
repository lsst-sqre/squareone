---
"squareone": minor
---

Integrate BroadcastBannerStack with Semaphore API via semaphore-client

The BroadcastBannerStack component now fetches broadcast messages from the Semaphore API using the new `@lsst-sqre/semaphore-client` package. Key changes:

- Prefetch broadcasts in the root layout using service discovery for the Semaphore API URL
- Consolidate BroadcastBannerStack as a client component with React Query hydration
- Remove the legacy maintenance category from BroadcastBanner
- Add a mock Semaphore API endpoint (`/api/dev/semaphore/v1/broadcasts`) for local development
