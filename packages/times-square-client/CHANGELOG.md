# @lsst-sqre/times-square-client

## 1.0.0

### Minor Changes

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

- Updated dependencies [[`8d837f6`](https://github.com/lsst-sqre/squareone/commit/8d837f68b671f2f4ecafd41cc3d97ab4958c0baa), [`5dba6a8`](https://github.com/lsst-sqre/squareone/commit/5dba6a88de1bba974ef796b0b8a5c3cc65803867)]:
  - @lsst-sqre/repertoire-client@0.2.0
