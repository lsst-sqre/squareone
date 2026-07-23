---
"@lsst-sqre/semaphore-client": minor
"squareone": minor
---

Report handled-but-critical broadcast errors to Sentry (DM-55604). The semaphore-client broadcasts `queryFn` now runs through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: it still degrades gracefully to an empty broadcasts list on any failure, but report-worthy failures (a `ZodError` from API contract drift — the DM-55599 scenario — a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected auth failures (401/403) stay quiet. The squareone app supplies that hook via a new `makeReportError` in `src/lib/sentry/`, which calls `Sentry.captureException` with site/package context tags and is guarded by an in-memory dedupe window (once per session client-side, once per ~15-minute window server-side) so 60 s polling cannot flood Sentry during an outage. It is wired at both broadcast call sites: the `layout.tsx` RSC prefetch and the client-side `BroadcastBannerStack`. `@lsst-sqre/semaphore-client` now re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling.
