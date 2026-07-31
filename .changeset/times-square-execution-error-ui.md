---
'squareone': minor
---

Adopt the Times Square `execution_error` contract in the Times Square UI (DM-55470). `TimesSquareHtmlEventsProvider` no longer carries its own SSE transport: the client provider subscribes through `@lsst-sqre/times-square-client`'s `subscribeToHtmlEvents` and builds its URL with `createHtmlEventsUrl`, so events are schema-validated by the package instead of being parsed inline. The bounded-reconnect budget (5 consecutive connection failures, 1 s linear backoff), the terminal `connectionFailed` alert, and the once-per-subscription Sentry capture (tagged `site: times-square-sse`) behave as before, now driven by the package's terminal `SseConnectionFailedError`. The events context gains an `executionError` field carrying the API's terminal failure object (`code`, `title`, `message`), `null` while execution is pending or has succeeded — including against Times Square deployments predating DM-55470, which omit the field.

The panel's Recompute action now issues its request through the package's shared re-run mutation (`useRerunPage`) instead of a raw `DELETE fetch`, so both re-run paths share one transport, credentialed request, and html-status cache invalidation. The failure message and the Sentry capture (tagged `site: times-square-recompute`) are unchanged, and the button is disabled while a re-run request is in flight.
