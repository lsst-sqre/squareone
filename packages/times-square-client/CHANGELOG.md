# @lsst-sqre/times-square-client

## 3.1.0

### Minor Changes

- [#631](https://github.com/lsst-sqre/squareone/pull/631) [`4b89dca`](https://github.com/lsst-sqre/squareone/commit/4b89dca40072e19ef793ff2feac837564f726331) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopt the Times Square `execution_error` contract (DM-55470). `HtmlStatusSchema` and `HtmlEventSchema` now carry an optional-nullable `execution_error` object that defaults to `null`, so responses from Times Square deployments predating DM-55470 — which omit the key entirely — continue to parse. The new `ExecutionErrorSchema` parses `code` as a plain string for forward compatibility, with the codes known at build time (`timeout`, `jupyter_error`, `unknown`, `result_unavailable`) exported as the `EXECUTION_ERROR_CODES` const. Failed-state mock fixtures (`mockExecutionError`, `mockHtmlStatusFailed`, `mockHtmlEventFailed`) are available for development and testing.

  A reported `execution_error` is now treated as terminal by the html-status polling path: `htmlStatusQueryOptions` and `htmlStatusUrlQueryOptions` compute `refetchInterval` from the cached status, returning `false` once `execution_error` is non-null instead of polling the endpoint forever. Invalidating the query (as a re-run does) resumes the normal 1 s cadence, and polling behavior is otherwise unchanged. `useHtmlStatus` surfaces the failure as a new `executionError` field, `null` while execution is pending or has succeeded.

  The SSE path treats `execution_error` as terminal too: `subscribeToHtmlEvents` now auto-aborts on an event carrying a non-null `execution_error`, not only on a successful `complete` event with an `html_hash`. A failed run reports `complete` with no `html_hash`, so the previous condition alone left the stream open indefinitely. The terminal event is still delivered to `onEvent` first, then `onComplete` fires and the stream is aborted; `autoAbortOnComplete: false` disables both terminal conditions.

  The package can now request a re-run, which is how a terminal failure is cleared. `deletePageHtml(baseUrl, pageName, params)` and `deleteHtmlByUrl(htmlUrl, params)` issue Times Square's `DELETE /v1/pages/{page}/html` soft delete and return the parsed `DeleteHtmlResponse` (`html_url`, `html_events_url`); the two call shapes mirror `fetchHtmlStatus`/`fetchHtmlStatusByUrl` so a consumer holding either a page name or a fully-formed `html_url` can re-run without rebuilding the other. `rerunPageMutationOptions(queryClient)` — the package's first mutation-options factory, in a new `mutation-options.ts` alongside `query-options.ts` — wraps them behind a `RerunPageVariables` union and, on success, invalidates every html-status query by the shared `['times-square', 'html-status']` key prefix, covering both the `htmlStatusForPage` and `htmlStatusByUrl` key shapes. That drops the cached terminal `execution_error`, so polling resumes on the refetched status. The `useRerunPage` hook is the React entry point, filling in the repertoire-discovered base URL and exposing `rerunPage`, `rerunPageAsync`, `isPending`, `isError`, `error`, and `reset`. In-flight re-runs are observable via the new `timesSquareKeys.rerunPage()` mutation key.

  The `@tanstack/react-query` peer range floor is raised from `^5` to `^5.82.0`. `rerunPageMutationOptions` is built on the `mutationOptions` helper, which first shipped in `@tanstack/react-query` 5.82.0 (5.81.5, the last 5.81.x release, does not export it), so an early-5.x consumer would previously have failed at import.

  The vendored `openapi.json` is re-vendored at Times Square 0.25.0 (from 0.24.2.dev9+g3ee2b2a55), the release that ships the `execution_error` contract. The only API-surface change is on the `htmlstatus` response: `HtmlStatus` gains an optional-nullable `execution_error`, backed by the new `HtmlExecutionError` (`code`, `title`, `message`) and `NotebookExecutionErrorCode` (`timeout`, `jupyter_error`, `unknown`, `result_unavailable`) schemas — exactly what `ExecutionErrorSchema` already models. The SSE `html/events` payload is not schema-modeled upstream (the endpoint declares an untyped `text/event-stream` response), so `HtmlEventSchema`'s `execution_error` remains client-side only.

  `subscribeToHtmlEvents` also gained optional bounded-reconnect options. `maxReconnectAttempts` caps the number of consecutive connection failures before the subscription gives up: the stream is aborted and a terminal `SseConnectionFailedError` (carrying the last underlying error as `cause` and the failure count as `attempts`) is reported through `onError`, so a consumer can drive a connection-failed UI state and a once-only error capture. `reconnectBackoffMs` sets a base delay between reconnect attempts that scales linearly with the failure count, capped at ten times the base delay so the wait plateaus rather than climbing without bound through a long outage when `maxReconnectAttempts` is left unset. The failure counter resets whenever a connection opens successfully. Both options default to unset, leaving the transport's existing unbounded retry behavior unchanged.

### Patch Changes

- [#618](https://github.com/lsst-sqre/squareone/pull/618) [`9f5604b`](https://github.com/lsst-sqre/squareone/commit/9f5604b8a0caf825fbb11211a203ac25eb186335) Thanks [@jonathansick](https://github.com/jonathansick)! - Refresh the vendored OpenAPI specs for the Repertoire and Times Square clients

  - `repertoire-client`: re-vendored `openapi.json` at Repertoire 2.1.0 (from 2.0.0). The only API-surface change is the `operationId` on `/api/registry`, which is now `get_oai_api_registry_get` for both the GET and POST operations. No schemas changed, so the Zod schemas and types are unaffected.
  - `times-square-client`: re-vendored `openapi.json` at Times Square 0.24.2.dev9+g3ee2b2a55 (from 0.23.1.dev24+g576ef1393). The `ValidationError` schema gained two optional fields, `input` and `ctx`; neither is required, and `ValidationErrorSchema` strips unknown keys, so existing parsing is unchanged.

- [#631](https://github.com/lsst-sqre/squareone/pull/631) [`1a9e547`](https://github.com/lsst-sqre/squareone/commit/1a9e54771fcac50fb906f69e9e92f891434c4d95) Thanks [@jonathansick](https://github.com/jonathansick)! - Accept the idle HTML-events payload from Times Square. `HtmlEventSchema` required a non-null `date_submitted` and `execution_status`, but Times Square's `HtmlEventsModel` declares both as nullable and the SSE stream emits an event on a fixed interval whether or not there is anything to report. A page instance with neither a Noteburst job nor a cached rendering therefore yields an event with `date_submitted`, `date_started`, `date_finished`, `execution_status`, `execution_duration`, and `html_hash` all null — only `html_url` is populated. Both fields are now `.nullable()`, matching the other execution fields.

  Against a healthy server this made `subscribeToHtmlEvents` drop the event and report an `SseInvalidEventError` as API contract drift. Consumers already typed `dateSubmitted` and `executionStatus` as nullable and render nothing for a null status, so no downstream behavior changes. The SSE payload is not described in Times Square's OpenAPI spec — the endpoint declares an untyped `text/event-stream` response — so this mismatch could not be caught by re-vendoring `openapi.json`.

  The dev mocks gain an idle state so the payload is reproducible without a live Times Square: `?a=4` (`IDLE_A_VALUE`) reports a page instance that has nothing to say yet, alongside the existing pending (`2`) and failing (`3`) magic values.

- Updated dependencies [[`9f5604b`](https://github.com/lsst-sqre/squareone/commit/9f5604b8a0caf825fbb11211a203ac25eb186335)]:
  - @lsst-sqre/repertoire-client@0.4.1

## 3.0.0

### Minor Changes

- [#608](https://github.com/lsst-sqre/squareone/pull/608) [`3ed93f1`](https://github.com/lsst-sqre/squareone/commit/3ed93f1cd46cb72de6da0db4099ceee8b404d24a) Thanks [@jonathansick](https://github.com/jonathansick)! - Report handled-but-critical Times Square query and SSE errors to Sentry (DM-55604). The `githubContentsQueryOptions` and `githubPrContentsQueryOptions` factories now run through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: they still degrade gracefully (empty nav tree / empty-PR contents on any failure), but report-worthy failures (a `ZodError` from API contract drift, a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected failures (401/403) stay quiet. Both factories gain `reportError` / `context` / `isServer` config keys (mirroring `broadcastsQueryOptions` and `discoveryQueryOptions`), exposed through a new `GitHubContentsQueryConfig` type; the PR-contents query folds its `owner`/`repo`/`commit` identifiers into the forwarded context so the reporter can tag the failing PR preview.

  `subscribeToHtmlEvents` no longer silently drops SSE events that fail `HtmlEventSchema` validation. A JSON event that fails schema parse is API contract drift, not a benign heartbeat, so it now invokes the subscription's `onError` callback with an `Error` carrying the underlying `ZodError` as `cause` — letting the app route the failure to Sentry. Non-JSON heartbeats are still ignored.

  `@lsst-sqre/times-square-client` now re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling.

### Patch Changes

- Updated dependencies [[`e41ac1f`](https://github.com/lsst-sqre/squareone/commit/e41ac1f152655e3241a44726dd79560d427ce967), [`9c50664`](https://github.com/lsst-sqre/squareone/commit/9c50664c7a78ed2f42b8a00accaa4437617c7883)]:
  - @lsst-sqre/api-client-core@0.2.0
  - @lsst-sqre/repertoire-client@0.4.0

## 2.2.0

### Minor Changes

- [#586](https://github.com/lsst-sqre/squareone/pull/586) [`911eaf6`](https://github.com/lsst-sqre/squareone/commit/911eaf6b80c8a7987ab2f10cb54f73b6c361461f) Thanks [@jonathansick](https://github.com/jonathansick)! - Make the Times Square page-metadata fetch PR-aware so GitHub PR-preview pages load again.

  `useTimesSquarePage` now accepts optional `owner`, `repo`, and `commit` coordinates on its options object. When all three are provided it fetches the PR-preview endpoint (`/v1/github-pr/{owner}/{repo}/{commit}/{path}`); otherwise it keeps the existing merged-page behavior (`/v1/github/{displayPath}`). The new parameters are optional and additive, so existing callers are unaffected. The four Squareone Times Square components now forward these coordinates from `TimesSquareUrlParametersContext`, fixing the notebook viewer, parameter form, live execution status, and download/edit links on PR-preview pages.

## 2.1.0

### Minor Changes

- [#535](https://github.com/lsst-sqre/squareone/pull/535) [`0ebcf3b`](https://github.com/lsst-sqre/squareone/commit/0ebcf3b6925c5e1863be8f8b0c7d7f8406a84f16) Thanks [@jonathansick](https://github.com/jonathansick)! - Add `normalizeGitHubContents()`, a client-side normalization pass that recursively merges duplicate sibling `directory` nodes (concatenating their contents in order) in the GitHub contents tree. The pass is applied when parsing both the `/github` and `/github-pr/...` responses, keeping the sidebar correct against Times Square deployments that predate the server-side fix (lsst-sqre/times-square#140); it is idempotent against fixed servers. New mock fixtures (`mockGitHubContentsNested`, `mockGitHubContentsDuplicateDirectories`) cover multi-segment nested directories and the duplicate-directory bug shape, and the squareone dev API route for `/times-square/api/v1/github` now serves the buggy shape so the normalizer is exercised in development.

## 2.0.0

### Patch Changes

- Updated dependencies [[`4a7c56a`](https://github.com/lsst-sqre/squareone/commit/4a7c56a1869677891ec9075314a08eb4d4289a92)]:
  - @lsst-sqre/repertoire-client@0.3.0

## 1.0.0

### Minor Changes

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add optional structured logger injection to client packages

  - Added a `Logger` type to each client package (`repertoire-client`, `semaphore-client`, `gafaelfawr-client`, `times-square-client`) matching pino's `(obj, msg)` calling convention
  - All `console.log`, `console.error`, and `console.warn` calls replaced with structured logger calls using `debug`, `error`, and `warn` levels
  - Logger is accepted as an optional parameter; when omitted, a console-based default preserves existing behavior for client-side and test usage
  - squareone's server-side layout now passes its pino logger to `discoveryQueryOptions`, `fetchServiceDiscovery`, and `broadcastsQueryOptions` for structured JSON output on GKE

- [#373](https://github.com/lsst-sqre/squareone/pull/373) [`49e148f`](https://github.com/lsst-sqre/squareone/commit/49e148f8e301664e18ac44b78531bd738b559dc8) Thanks [@jonathansick](https://github.com/jonathansick)! - Add direct URL support to useHtmlStatus hook

  The `useHtmlStatus` hook now accepts a `htmlStatusUrl` option that allows using a pre-fetched URL directly, rather than building the URL from a page name:

  ```typescript
  const { htmlStatusUrl } = useTimesSquarePage(githubSlug, { repertoireUrl });
  const { htmlAvailable, htmlUrl } = useHtmlStatus("", params, {
    htmlStatusUrl,
  });
  ```

  This enables efficient usage patterns where page metadata is already fetched and the HTML status URL can be passed directly. Also adds `fetchHtmlStatusByUrl` and `htmlStatusUrlQueryOptions` for direct URL-based queries.

- [#373](https://github.com/lsst-sqre/squareone/pull/373) [`5d29200`](https://github.com/lsst-sqre/squareone/commit/5d292008607c9ba4fcb72da79b8427227cb471e0) Thanks [@jonathansick](https://github.com/jonathansick)! - New `@lsst-sqre/times-square-client` package for Times Square API integration

  This package provides a type-safe client for the Times Square notebook execution API with TanStack Query integration:

  - **Zod schemas** for all Times Square API responses (pages, HTML status, GitHub contents, PR previews)
  - **Client functions** with runtime validation (`fetchPage`, `fetchHtmlStatus`, `fetchGitHubContents`, etc.)
  - **TanStack Query integration** with query key factories and query options for caching and prefetching
  - **SSE handler** for real-time notebook execution status via Server-Sent Events
  - **React hooks** for client components (`useTimesSquarePage`, `useHtmlStatus`, `useGitHubContents`, `useGitHubPrContents`)
  - **Mock data and test utilities** for development and testing

  This package is part of the App Router migration, replacing the existing SWR-based hooks with TanStack Query patterns.

### Patch Changes

- Updated dependencies [[`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e), [`8d837f6`](https://github.com/lsst-sqre/squareone/commit/8d837f68b671f2f4ecafd41cc3d97ab4958c0baa), [`5dba6a8`](https://github.com/lsst-sqre/squareone/commit/5dba6a88de1bba974ef796b0b8a5c3cc65803867)]:
  - @lsst-sqre/repertoire-client@0.2.0
