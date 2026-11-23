---
'@lsst-sqre/api-client-core': minor
---

Retry server-side network failures once in `reportingQueryFn`

When a server-side fetch fails at the network level (an error with no HTTP status that isn't a `ZodError`, such as `TypeError: fetch failed` from a reset connection), `reportingQueryFn` now retries it once, immediately. If the retry succeeds, its value is returned, the first failure is logged as a warning with the call-site context, and nothing is reported, so a single dropped connection during a server render no longer reaches Sentry. If the retry fails as well, the existing failure path runs once for the retry's error: it is logged as an error, reported if report-worthy, and the fallback is returned.

HTTP errors (4xx and 5xx) and contract drift are not retried and are classified and reported as before, and browser behaviour is unchanged. Query options built on `reportingQueryFn` get the retry without any changes. The definition of a network-level failure is now shared by `classifyError` and the retry.
