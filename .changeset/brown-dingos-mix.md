---
'squareone': minor
---

Implement background recomputation for cached Times Square pages. The "Recompute" button submits a request to Times Square's `DELETE /v1/pages/:page/html?{params}` endpoint, which causes a background recomputation of the notebook and re-rendering of the cached HTML.

The new `TimesSquareHtmlEventsProvider` is a React context provider that provides real-time updates from Times Square about the status of an HTML rendering for a given set of parameters using Times Square's `/v1/pages/:page/html/events/{params}` endpoint. Squareone uses `@microsoft/fetch-event-source` to subscribe to this server-sent events (SSE) endpoint. Using this provider, the UI is able to show new data to the user, including the status of the computation, and once the computation is complete, the date/age of computation and the execution time.
