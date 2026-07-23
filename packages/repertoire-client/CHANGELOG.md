# @lsst-sqre/repertoire-client

## 0.4.0

### Minor Changes

- [#608](https://github.com/lsst-sqre/squareone/pull/608) [`9c50664`](https://github.com/lsst-sqre/squareone/commit/9c50664c7a78ed2f42b8a00accaa4437617c7883) Thanks [@jonathansick](https://github.com/jonathansick)! - Report handled-but-critical service-discovery errors to Sentry (DM-55604). The repertoire-client discovery `queryFn` now runs through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: it still degrades gracefully to an empty discovery result on any failure, but report-worthy failures (a `ZodError` from API contract drift, a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected auth failures (401/403) stay quiet. `discoveryQueryOptions` gains `reportError` / `context` / `isServer` config keys (mirroring `broadcastsQueryOptions`), and `@lsst-sqre/repertoire-client` re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling.

  The squareone app's `layout.tsx` RSC prefetch now wires `makeReportError({ isServer: true })` into the discovery prefetch, and its broadcasts-prefetch `catch` no longer silently pino-logs discovery-URL-resolution failures: a new `reportPrefetchError` helper classifies the caught error and reports the report-worthy ones (including server-side network failures) to Sentry so a silent prefetch outage surfaces rather than staying hidden in the server logs.

### Patch Changes

- Updated dependencies [[`e41ac1f`](https://github.com/lsst-sqre/squareone/commit/e41ac1f152655e3241a44726dd79560d427ce967)]:
  - @lsst-sqre/api-client-core@0.2.0

## 0.3.0

### Minor Changes

- [#468](https://github.com/lsst-sqre/squareone/pull/468) [`4a7c56a`](https://github.com/lsst-sqre/squareone/commit/4a7c56a1869677891ec9075314a08eb4d4289a92) Thanks [@jonathansick](https://github.com/jonathansick)! - Refresh the vendored Repertoire client to match live Repertoire 2.0.0

  - Re-vendored `openapi.json` at 2.0.0: dropped the now-excluded `ivoa_standard_id` from `ApiVersion`, added `environment_name` to `Discovery`, and added the `local` flag to the InfluxDB database models.
  - Reconciled the Zod schemas: `DiscoverySchema` now accepts the optional `environment_name`, `InfluxDatabaseSchema` gained `local` (defaults to `false` when omitted, matching the server's `exclude_defaults` serialization), and `ApiVersionSchema` dropped `ivoa_standard_id` (removed from `ApiVersion` in 2.0.0; unknown keys are stripped by default, so legacy payloads still parse).
  - Rewrote `mockDiscovery` to mirror the live `dp1`/`dp02`/`dp03` datasets with real service and semantic version keys (`sia-query-2.0`, `soda-sync-1.0`, `soda-async-1.0`, `hips-list-1.0`, `tables`, `gms-search-1.0`) plus the `datalink`/`gms` services. The mock now matches live fidelity: `dp03` is catalog-only (no `cutout`), cutout version URLs are not dataset-scoped (`/api/cutout/sync`, `/api/cutout/jobs`), and `datalink` carries its `openapi` URL and `datalink-links-1.1` version. Internal services (`gafaelfawr`, `times-square`) keep their `v1` version key so `getGafaelfawrUrl()`/`getTimesSquareUrl()` and the Header nav / settings helpers still resolve.

## 0.2.0

### Minor Changes

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add optional structured logger injection to client packages

  - Added a `Logger` type to each client package (`repertoire-client`, `semaphore-client`, `gafaelfawr-client`, `times-square-client`) matching pino's `(obj, msg)` calling convention
  - All `console.log`, `console.error`, and `console.warn` calls replaced with structured logger calls using `debug`, `error`, and `warn` levels
  - Logger is accepted as an optional parameter; when omitted, a console-based default preserves existing behavior for client-side and test usage
  - squareone's server-side layout now passes its pino logger to `discoveryQueryOptions`, `fetchServiceDiscovery`, and `broadcastsQueryOptions` for structured JSON output on GKE

- [#357](https://github.com/lsst-sqre/squareone/pull/357) [`8d837f6`](https://github.com/lsst-sqre/squareone/commit/8d837f68b671f2f4ecafd41cc3d97ab4958c0baa) Thanks [@jonathansick](https://github.com/jonathansick)! - New `@lsst-sqre/repertoire-client` package for Rubin Science Platform service discovery

  This package provides a reusable client for the Repertoire API, enabling dynamic service discovery across monorepo apps:

  - **Zod schemas** for runtime validation of API responses
  - **ServiceDiscoveryQuery** class with convenience methods for querying applications, services, and datasets
  - **TanStack Query integration** with `discoveryQueryOptions()` for server prefetching and client-side caching
  - **useServiceDiscovery hook** for client components with automatic hydration support
  - **Mock data** for development and testing

  Integrated into squareone:

  - Added TanStack Query providers with server-side prefetching in root layout
  - Components can now use `useServiceDiscovery()` to check service availability
  - Service URLs dynamically discovered instead of hard-coded in configuration

### Patch Changes

- [#373](https://github.com/lsst-sqre/squareone/pull/373) [`5dba6a8`](https://github.com/lsst-sqre/squareone/commit/5dba6a88de1bba974ef796b0b8a5c3cc65803867) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix `getTimesSquareUrl()` to return versioned v1 API URL

  Times Square is an internal service with a versioned API, not a UI service. The `getTimesSquareUrl()` method now correctly returns the v1 version URL from internal services (e.g., `https://data.lsst.cloud/times-square/api/v1`), matching the pattern used by `getGafaelfawrUrl()`.

  This aligns with the actual Repertoire service discovery data where times-square is listed under `services.internal` with `versions.v1.url`.
