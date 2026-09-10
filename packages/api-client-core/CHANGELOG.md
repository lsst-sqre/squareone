# @lsst-sqre/api-client-core

## 0.3.0

### Minor Changes

- [#699](https://github.com/lsst-sqre/squareone/pull/699) [`4589fc6`](https://github.com/lsst-sqre/squareone/commit/4589fc60c884b64837c4c53029dbdae503ce77ae) Thanks [@jonathansick](https://github.com/jonathansick)! - Update zod from 3 to 4. The exported schemas and inferred types are unchanged, but `ZodError` instances thrown on API contract drift now have zod 4's shape. Record schemas declare their string keys explicitly, and ISO datetime and URL fields use the top-level `z.iso.datetime()` and `z.url()` validators. The file-factory lifecycle hooks are validated with `z.custom()` rather than the removed `z.function().args().returns()` chain, and nested config sections use `.prefault({})` so their inner defaults still apply. The test-data generators in the client packages now use `zod-schema-faker`, which supports zod 4, in place of `@anatine/zod-mock`.

## 0.2.0

### Minor Changes

- [#608](https://github.com/lsst-sqre/squareone/pull/608) [`e41ac1f`](https://github.com/lsst-sqre/squareone/commit/e41ac1f152655e3241a44726dd79560d427ce967) Thanks [@jonathansick](https://github.com/jonathansick)! - Add the `@lsst-sqre/api-client-core` workspace package (DM-55604): the single source of truth for the shared `Logger` type, an error classifier that distinguishes expected errors (HTTP 401/403) from report-worthy ones (ZodError contract drift, HTTP 5xx, plus server-side network failures — log-only in the browser), and a `reportingQueryFn` wrapper that returns a caller-supplied benign fallback on any failure while logging all failures and invoking an injected, Sentry-agnostic `reportError(err, context)` hook for report-worthy ones.
