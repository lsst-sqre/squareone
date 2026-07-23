# @lsst-sqre/times-square-client

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
