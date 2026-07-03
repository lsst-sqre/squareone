---
'@lsst-sqre/times-square-client': minor
---

Rewrite the Times Square SSE layer (`subscribeToHtmlEvents`) on the shared `@lsst-sqre/sse-client` transport, replacing the unmaintained `@microsoft/fetch-event-source` dependency. The public API is unchanged — `subscribeToHtmlEvents()`, `createHtmlEventsUrl()`, `SubscribeOptions`, `HtmlEventCallback`, and `SseErrorCallback` keep their exact signatures — and Zod validation of `HtmlEvent`, auto-abort on execution completion, `onComplete`, and the optional structured `Logger` all remain in this layer. Reconnect policy now follows the transport's defaults: automatic reconnection with backoff, honoring server `retry:` fields, including after HTTP 4xx responses. Connection interruptions are surfaced through `onError`, and scheduled reconnects are logged through the `Logger` when provided.
