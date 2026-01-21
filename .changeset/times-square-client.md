---
"@lsst-sqre/times-square-client": minor
---

New `@lsst-sqre/times-square-client` package for Times Square API integration

This package provides a type-safe client for the Times Square notebook execution API with TanStack Query integration:

- **Zod schemas** for all Times Square API responses (pages, HTML status, GitHub contents, PR previews)
- **Client functions** with runtime validation (`fetchPage`, `fetchHtmlStatus`, `fetchGitHubContents`, etc.)
- **TanStack Query integration** with query key factories and query options for caching and prefetching
- **SSE handler** for real-time notebook execution status via Server-Sent Events
- **React hooks** for client components (`useTimesSquarePage`, `useHtmlStatus`, `useGitHubContents`, `useGitHubPrContents`)
- **Mock data and test utilities** for development and testing

This package is part of the App Router migration, replacing the existing SWR-based hooks with TanStack Query patterns.
