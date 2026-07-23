# @lsst-sqre/api-client-core

## 0.2.0

### Minor Changes

- [#608](https://github.com/lsst-sqre/squareone/pull/608) [`e41ac1f`](https://github.com/lsst-sqre/squareone/commit/e41ac1f152655e3241a44726dd79560d427ce967) Thanks [@jonathansick](https://github.com/jonathansick)! - Add the `@lsst-sqre/api-client-core` workspace package (DM-55604): the single source of truth for the shared `Logger` type, an error classifier that distinguishes expected errors (HTTP 401/403) from report-worthy ones (ZodError contract drift, HTTP 5xx, plus server-side network failures — log-only in the browser), and a `reportingQueryFn` wrapper that returns a caller-supplied benign fallback on any failure while logging all failures and invoking an injected, Sentry-agnostic `reportError(err, context)` hook for report-worthy ones.
