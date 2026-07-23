---
"@lsst-sqre/api-client-core": minor
---

Add the `@lsst-sqre/api-client-core` workspace package (DM-55604): the single source of truth for the shared `Logger` type, an error classifier that distinguishes expected errors (HTTP 401/403) from report-worthy ones (ZodError contract drift, HTTP 5xx, plus server-side network failures — log-only in the browser), and a `reportingQueryFn` wrapper that returns a caller-supplied benign fallback on any failure while logging all failures and invoking an injected, Sentry-agnostic `reportError(err, context)` hook for report-worthy ones.
