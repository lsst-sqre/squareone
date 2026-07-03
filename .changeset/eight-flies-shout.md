---
'squareone': patch
---

Migrate `TimesSquareHtmlEventsProviderClient` to `subscribeToHtmlEvents()` from `@lsst-sqre/times-square-client`, removing the duplicated inline SSE implementation and the local `HtmlEvent` type. The app's Times Square SSE path now gains Zod validation of events, `credentials: 'include'` (Gafaelfawr same-origin cookie auth), and automatic reconnection with backoff from the shared `@lsst-sqre/sse-client` transport. This removes `@microsoft/fetch-event-source` from `apps/squareone` — the dependency is now gone from the entire repo.
