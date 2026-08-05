---
'@lsst-sqre/times-square-client': patch
'squareone': patch
---

Accept the idle HTML-events payload from Times Square. `HtmlEventSchema` required a non-null `date_submitted` and `execution_status`, but Times Square's `HtmlEventsModel` declares both as nullable and the SSE stream emits an event on a fixed interval whether or not there is anything to report. A page instance with neither a Noteburst job nor a cached rendering therefore yields an event with `date_submitted`, `date_started`, `date_finished`, `execution_status`, `execution_duration`, and `html_hash` all null — only `html_url` is populated. Both fields are now `.nullable()`, matching the other execution fields.

Against a healthy server this made `subscribeToHtmlEvents` drop the event and report an `SseInvalidEventError` as API contract drift. Consumers already typed `dateSubmitted` and `executionStatus` as nullable and render nothing for a null status, so no downstream behavior changes. The SSE payload is not described in Times Square's OpenAPI spec — the endpoint declares an untyped `text/event-stream` response — so this mismatch could not be caught by re-vendoring `openapi.json`.

The dev mocks gain an idle state so the payload is reproducible without a live Times Square: `?a=4` (`IDLE_A_VALUE`) reports a page instance that has nothing to say yet, alongside the existing pending (`2`) and failing (`3`) magic values.
