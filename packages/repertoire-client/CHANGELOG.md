# @lsst-sqre/repertoire-client

## 0.5.1

### Patch Changes

- [#776](https://github.com/lsst-sqre/squareone/pull/776) [`4b6d221`](https://github.com/lsst-sqre/squareone/commit/4b6d2210a326e7df32ab3db431bd6eff8b1c12b6) Thanks [@jonathansick](https://github.com/jonathansick)! - Correct the documentation of `getTimesSquareUrl()`: the Times Square service's base `url` (from `getInternalServiceUrl('times-square')`) is the unversioned API root, such as `https://data.lsst.cloud/times-square/api`, and `getTimesSquareUrl()` returns the `v1` endpoint URL under it. Its behavior is unchanged.

## 0.5.0

### Minor Changes

- [#723](https://github.com/lsst-sqre/squareone/pull/723) [`6dd1547`](https://github.com/lsst-sqre/squareone/commit/6dd1547fd0ef6cd04148d111764851baa96f6ce7) Thanks [@jonathansick](https://github.com/jonathansick)! - Support the Repertoire 3.0.0 service discovery contract while still parsing 2.x responses.

  - New `EnvironmentSchema` / `Environment` for the top-level `environment` object (`name`, `label`, `title`, `title_long`, `description`, `docs_url`), which is optional so 2.x discovery still parses. `environment_name` is kept but deprecated upstream.
  - UI, internal, and data services gain `title`, `docs_url`, and `required_scopes` (defaults to `[]`). Internal and data services also gain `quota_labels`, a mapping of Gafaelfawr quota labels to a `QuotaLabel` (`title`, and `internal`, which defaults to `false`). Datasets gain `obscore_config`.
  - New `ServiceDiscoveryQuery` helpers:
    - `getEnvironment()` returns the environment object, or `null`.
    - `getEnvironmentName()` returns `environment.name`, falling back to `environment_name`.
    - `getUiService(name)` and `getDataService(datasetId, name)`.
    - `canAccessService(service, userScopes?)` is true when the service requires no scopes or when `userScopes` is undefined (for an anonymous visitor). Otherwise the user must hold every required scope.
    - `getQuotaLabelIndex()` maps each quota label to its service's name, title, and docs URL, plus the label's title and `internal` flag. When a label appears more than once, the first occurrence wins, and data services come before internal services.
    - `getSquareoneUrl()` and `getComanageUrl()`.
  - `mockDiscovery` now uses the 3.0.0 shape. It adds the environment and the service titles, docs URLs, required scopes, and quota labels that data-dev publishes. It also adds the Argo CD, Chronograf, Kafdrop, WebDAV, COmanage, and Squareone UI services and a `prompt` dataset with no `docs_url`.
  - The vendored `openapi.json` is now Repertoire 3.0.0. The `fetch-openapi` script still defaults to `data.lsst.cloud`, but a `REPERTOIRE_HOST` environment variable can override the host. For example, `REPERTOIRE_HOST=data-dev.lsst.cloud` fetches from data-dev until production runs Repertoire 3.0.

- [#766](https://github.com/lsst-sqre/squareone/pull/766) [`c34f0ff`](https://github.com/lsst-sqre/squareone/commit/c34f0ffc78d90562564e8aff7c3a03d9996eb8f0) Thanks [@jonathansick](https://github.com/jonathansick)! - New `mockDiscoveryDataDev` and `mockDiscovery2x` mocks, alongside `mockDiscovery`, for tests and Storybook that need a whole real environment. `mockDiscoveryDataDev` is the live data-dev (`idfdev`) Repertoire 3.0.0 discovery document, and `mockDiscovery2x` is the production Repertoire 2.1.0 document, which has no `environment` object and no service titles, docs URLs, or scopes. Both are parsed through `DiscoverySchema` from the package's test fixtures.

- [#766](https://github.com/lsst-sqre/squareone/pull/766) [`c1cd54d`](https://github.com/lsst-sqre/squareone/commit/c1cd54df79f4cdadcd65a42269bea3e7e9f54c80) Thanks [@jonathansick](https://github.com/jonathansick)! - `useServiceDiscovery` now returns `isFetching`, which is `true` whenever a discovery fetch is in flight, including a `refetch` of a document that has already loaded (`isPending` is only `true` until the first document loads).

  In the browser, the discovery query no longer answers from `fetchServiceDiscovery`'s module-level cache, which exists to share discovery across server requests. TanStack Query is the browser's cache, so a `refetch` now always requests the document from Repertoire instead of returning the cached copy for up to 5 minutes. Server-side fetches still use the module-level cache.

- [#699](https://github.com/lsst-sqre/squareone/pull/699) [`4589fc6`](https://github.com/lsst-sqre/squareone/commit/4589fc60c884b64837c4c53029dbdae503ce77ae) Thanks [@jonathansick](https://github.com/jonathansick)! - Update zod from 3 to 4. The exported schemas and inferred types are unchanged, but `ZodError` instances thrown on API contract drift now have zod 4's shape. Record schemas declare their string keys explicitly, and ISO datetime and URL fields use the top-level `z.iso.datetime()` and `z.url()` validators. The file-factory lifecycle hooks are validated with `z.custom()` rather than the removed `z.function().args().returns()` chain, and nested config sections use `.prefault({})` so their inner defaults still apply. The test-data generators in the client packages now use `zod-schema-faker`, which supports zod 4, in place of `@anatine/zod-mock`.

### Patch Changes

- [#723](https://github.com/lsst-sqre/squareone/pull/723) [`c72b855`](https://github.com/lsst-sqre/squareone/commit/c72b85509bc8df3f121aab4b4ca2fcd6f5795ad7) Thanks [@jonathansick](https://github.com/jonathansick)! - `mockDiscovery` now includes the `dp2` dataset that production service discovery publishes, with its description, a `docs_url` of `https://dp2.lsst.io`, and the same TAP, SIA, HiPS, SODA cutout, DataLink, and GMS services as `dp1`. Storybook and the development discovery route now list Data Preview 2 first, ahead of Data Preview 1. The `prompt` dataset still has no `docs_url`, as on data-dev.

- [#766](https://github.com/lsst-sqre/squareone/pull/766) [`e74c24f`](https://github.com/lsst-sqre/squareone/commit/e74c24f10db40c5f71dd812fa6f754c60c0f78f3) Thanks [@jonathansick](https://github.com/jonathansick)! - The development `mockDiscovery` document now lists a `nublado-controller` internal service, as data-dev does, so the Notebook aspect has both a UI service and an API in development. Its `/nublado` URL and `openapi.json` are not mocked.

- [#695](https://github.com/lsst-sqre/squareone/pull/695) [`99d9b58`](https://github.com/lsst-sqre/squareone/commit/99d9b588e3f103d29f0d955c1a50333579efc3c3) Thanks [@jonathansick](https://github.com/jonathansick)! - Update the test and Storybook toolchain to Vite 8, which builds with Rolldown and Oxc instead of Rollup and esbuild. `@vitejs/plugin-react` moves to 6 (which requires Vite 8) and jsdom moves from 26 to 30, now declared explicitly by every package whose tests run in a jsdom environment. The squareone unit-test project sets its JSX runtime through Vite's `oxc` option instead of the deprecated `esbuild` option, and squared's Vite config is renamed to `vite.config.mts` so it loads under Vite's upcoming native config loader.
- Updated dependencies [[`4589fc6`](https://github.com/lsst-sqre/squareone/commit/4589fc60c884b64837c4c53029dbdae503ce77ae)]:
  - @lsst-sqre/api-client-core@0.3.0

## 0.4.1

### Patch Changes

- [#618](https://github.com/lsst-sqre/squareone/pull/618) [`9f5604b`](https://github.com/lsst-sqre/squareone/commit/9f5604b8a0caf825fbb11211a203ac25eb186335) Thanks [@jonathansick](https://github.com/jonathansick)! - Refresh the vendored OpenAPI specs for the Repertoire and Times Square clients

  - `repertoire-client`: re-vendored `openapi.json` at Repertoire 2.1.0 (from 2.0.0). The only API-surface change is the `operationId` on `/api/registry`, which is now `get_oai_api_registry_get` for both the GET and POST operations. No schemas changed, so the Zod schemas and types are unaffected.
  - `times-square-client`: re-vendored `openapi.json` at Times Square 0.24.2.dev9+g3ee2b2a55 (from 0.23.1.dev24+g576ef1393). The `ValidationError` schema gained two optional fields, `input` and `ctx`; neither is required, and `ValidationErrorSchema` strips unknown keys, so existing parsing is unchanged.

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
