---
'@lsst-sqre/sse-client': minor
---

Add the @lsst-sqre/sse-client package, the monorepo's shared Server-Sent Events (SSE) transport built on `eventsource-client`. The package follows the no-build-step pattern (consumers transpile TypeScript source directly) and exports:

- `subscribeToEventSource(url, options)` — a framework-agnostic subscribe function with raw `onMessage`/`onConnect`/`onDisconnect`/`onScheduleReconnect` callbacks, custom `headers`, `credentials` (defaulting to `'include'` for Gafaelfawr same-origin cookie auth), an external `AbortSignal`, and a `fetch` override. It returns a cleanup function that closes the connection and stops automatic reconnection. Payload parsing/validation is deliberately left to consumers.
- `useEventSource(url, options)` — a thin React hook wrapping the subscribe function with effect lifecycle management. The connection follows the component lifecycle and the `url` (pass `null` to disable); callbacks are read through a ref so identity changes never reconnect.
