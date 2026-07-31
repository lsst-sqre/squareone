---
"squareone": minor
---

Add Sentry capture and user-facing error states to the Times Square UI (DM-55604). `ExecStats` recompute is no longer fire-and-forget: it checks the response, shows a user-facing failure message, and reports the exception via `makeReportError`. `TimesSquareHtmlEventsProviderClient` now bounds its SSE reconnect attempts and enters a terminal-failure state (surfaced to the user) after the budget is exhausted, capturing the connection error once per subscription instead of retrying silently forever.
