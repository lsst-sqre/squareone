---
"squareone": minor
---

Migrate Times Square hooks from SWR to TanStack Query

All Times Square components now use hooks from `@lsst-sqre/times-square-client` instead of local SWR-based implementations:

- `TimesSquareParametersClient` - uses `useTimesSquarePage` for parameter metadata
- `TimesSquareGitHubPagePanelClient` - uses `useTimesSquarePage` for page info
- `TimesSquareHtmlEventsProviderClient` - uses `useTimesSquarePage` for events URL
- `TimesSquareNotebookViewerClient` - uses `useTimesSquarePage` and `useHtmlStatus` for notebook display
- `TimesSquareMainGitHubNavClient` - uses `useGitHubContents` for navigation tree
- `TimesSquarePrGitHubNavClient` - uses `useGitHubPrContents` for PR preview navigation
- PR Preview Page - uses `useGitHubPrContents` for check status and PR details

Deleted legacy SWR hooks:

- `apps/squareone/src/hooks/useTimesSquarePage.ts`
- `apps/squareone/src/components/TimesSquareNotebookViewer/useHtmlStatus.ts`
- `apps/squareone/src/components/TimesSquareMainGitHubNav/useGitHubContentsListing.ts`
- `apps/squareone/src/components/TimesSquarePrGitHubNav/useGitHubPrContentsListing.ts`
