---
"@lsst-sqre/repertoire-client": minor
"squareone": minor
---

Report handled-but-critical service-discovery errors to Sentry (DM-55604). The repertoire-client discovery `queryFn` now runs through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: it still degrades gracefully to an empty discovery result on any failure, but report-worthy failures (a `ZodError` from API contract drift, a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected auth failures (401/403) stay quiet. `discoveryQueryOptions` gains `reportError` / `context` / `isServer` config keys (mirroring `broadcastsQueryOptions`), and `@lsst-sqre/repertoire-client` re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling.

The squareone app's `layout.tsx` RSC prefetch now wires `makeReportError({ isServer: true })` into the discovery prefetch, and its broadcasts-prefetch `catch` no longer silently pino-logs discovery-URL-resolution failures: a new `reportPrefetchError` helper classifies the caught error and reports the report-worthy ones (including server-side network failures) to Sentry so a silent prefetch outage surfaces rather than staying hidden in the server logs.
