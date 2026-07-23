---
"@lsst-sqre/gafaelfawr-client": minor
"squareone": minor
---

Report handled-but-critical auth query errors to Sentry (DM-55604). The gafaelfawr-client `userInfoQueryOptions` and `loginInfoQueryOptions` now run through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: they still degrade gracefully (empty user info / null login info on any failure, so `isLoggedIn=false` and null-login-info behavior are unchanged), but report-worthy failures (a `ZodError` from API contract drift, a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected auth failures (401/403) stay quiet. This means an API outage is no longer indistinguishable from "not logged in", and a silently-null `csrfToken` from a non-auth failure becomes operator-visible. Both query options gain `reportError` / `context` / `isServer` config keys (mirroring `broadcastsQueryOptions` and `discoveryQueryOptions`), exposed through a new `AuthQueryConfig` type; `@lsst-sqre/gafaelfawr-client` now re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling. The `useUserInfo` and `useLoginInfo` hooks accept an optional query config and forward it to the query options.

The squareone app now injects a Sentry-backed `makeReportError` reporter at the header's `Login` (user-info) and `UserMenu` (login-info) components — the app-wide chokepoints for these queries — so report-worthy auth-query failures reach Sentry tagged with `site`/`package` context.
