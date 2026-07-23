---
"@lsst-sqre/times-square-client": minor
---

Report handled-but-critical Times Square query and SSE errors to Sentry (DM-55604). The `githubContentsQueryOptions` and `githubPrContentsQueryOptions` factories now run through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: they still degrade gracefully (empty nav tree / empty-PR contents on any failure), but report-worthy failures (a `ZodError` from API contract drift, a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected failures (401/403) stay quiet. Both factories gain `reportError` / `context` / `isServer` config keys (mirroring `broadcastsQueryOptions` and `discoveryQueryOptions`), exposed through a new `GitHubContentsQueryConfig` type; the PR-contents query folds its `owner`/`repo`/`commit` identifiers into the forwarded context so the reporter can tag the failing PR preview.

`subscribeToHtmlEvents` no longer silently drops SSE events that fail `HtmlEventSchema` validation. A JSON event that fails schema parse is API contract drift, not a benign heartbeat, so it now invokes the subscription's `onError` callback with an `Error` carrying the underlying `ZodError` as `cause` — letting the app route the failure to Sentry. Non-JSON heartbeats are still ignored.

`@lsst-sqre/times-square-client` now re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling.
