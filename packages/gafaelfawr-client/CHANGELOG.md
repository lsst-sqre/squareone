# @lsst-sqre/gafaelfawr-client

## 3.0.0

### Minor Changes

- [#608](https://github.com/lsst-sqre/squareone/pull/608) [`58e6dbb`](https://github.com/lsst-sqre/squareone/commit/58e6dbbc5a43748b087839e0fec8977ddb09af53) Thanks [@jonathansick](https://github.com/jonathansick)! - Report handled-but-critical auth query errors to Sentry (DM-55604). The gafaelfawr-client `userInfoQueryOptions` and `loginInfoQueryOptions` now run through the shared `reportingQueryFn` from `@lsst-sqre/api-client-core`: they still degrade gracefully (empty user info / null login info on any failure, so `isLoggedIn=false` and null-login-info behavior are unchanged), but report-worthy failures (a `ZodError` from API contract drift, a 5xx, or a server-side network error) now invoke an injectable `reportError` hook, while expected auth failures (401/403) stay quiet. This means an API outage is no longer indistinguishable from "not logged in", and a silently-null `csrfToken` from a non-auth failure becomes operator-visible. Both query options gain `reportError` / `context` / `isServer` config keys (mirroring `broadcastsQueryOptions` and `discoveryQueryOptions`), exposed through a new `AuthQueryConfig` type; `@lsst-sqre/gafaelfawr-client` now re-exports the `Logger` type from `@lsst-sqre/api-client-core` so existing imports keep compiling. The `useUserInfo` and `useLoginInfo` hooks accept an optional query config and forward it to the query options.

  The squareone app now injects a Sentry-backed `makeReportError` reporter at the header's `Login` (user-info) and `UserMenu` (login-info) components — the app-wide chokepoints for these queries — so report-worthy auth-query failures reach Sentry tagged with `site`/`package` context.

### Patch Changes

- Updated dependencies [[`e41ac1f`](https://github.com/lsst-sqre/squareone/commit/e41ac1f152655e3241a44726dd79560d427ce967), [`9c50664`](https://github.com/lsst-sqre/squareone/commit/9c50664c7a78ed2f42b8a00accaa4437617c7883)]:
  - @lsst-sqre/api-client-core@0.2.0
  - @lsst-sqre/repertoire-client@0.4.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`4a7c56a`](https://github.com/lsst-sqre/squareone/commit/4a7c56a1869677891ec9075314a08eb4d4289a92)]:
  - @lsst-sqre/repertoire-client@0.3.0

## 1.1.0

### Minor Changes

- [#443](https://github.com/lsst-sqre/squareone/pull/443) [`3ee4d61`](https://github.com/lsst-sqre/squareone/commit/3ee4d61e65f0a49fa0f2fa093528e6629564d140) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a service-token mutation stack mirroring the user-token one, for creating
  Gafaelfawr **service** tokens via the admin endpoint.

  - `AdminTokenRequestSchema` / `AdminTokenRequest` — request schema for the admin
    endpoint (`username`, `token_type: "service"`, `scopes`, optional `expires` and
    identity metadata `name`/`email`/`uid`/`gid`/`groups`), reusing the existing
    `{ token }` `CreateTokenResponseSchema`. Service tokens take no name (Gafaelfawr
    rejects `token_name` on this path).
  - `createServiceToken(request, csrfToken, baseUrl)` — `POST {base}/tokens` (the
    admin route, not the per-user `{base}/users/{username}/tokens`) with an
    `x-csrf-token` header.
  - `createServiceTokenMutationConfig` + `useCreateServiceToken()` — the hook
    sources the CSRF token from `useLoginInfo`, surfaces failures as
    `TokenCreationError`, and invalidates the bot user's token list on success.

## 1.0.0

### Minor Changes

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add optional structured logger injection to client packages

  - Added a `Logger` type to each client package (`repertoire-client`, `semaphore-client`, `gafaelfawr-client`, `times-square-client`) matching pino's `(obj, msg)` calling convention
  - All `console.log`, `console.error`, and `console.warn` calls replaced with structured logger calls using `debug`, `error`, and `warn` levels
  - Logger is accepted as an optional parameter; when omitted, a console-based default preserves existing behavior for client-side and test usage
  - squareone's server-side layout now passes its pino logger to `discoveryQueryOptions`, `fetchServiceDiscovery`, and `broadcastsQueryOptions` for structured JSON output on GKE

- [#368](https://github.com/lsst-sqre/squareone/pull/368) [`65ba6a5`](https://github.com/lsst-sqre/squareone/commit/65ba6a562d9fced7bce8a9f9074c1f3919af9e38) Thanks [@jonathansick](https://github.com/jonathansick)! - New `@lsst-sqre/gafaelfawr-client` package for Gafaelfawr authentication API

  This package provides a reusable client for the Gafaelfawr authentication API with TanStack Query integration:

  - **Zod schemas** for runtime validation of user info, tokens, and login responses
  - **React hooks** for common operations:
    - `useUserInfo` - Fetch authenticated user information
    - `useLoginInfo` - Get CSRF token and available scopes
    - `useUserTokens` - List user's access tokens
    - `useTokenDetails` - Get details of a specific token
    - `useCreateToken` - Create new user tokens
    - `useDeleteToken` - Revoke user tokens
    - `useTokenChangeHistory` - Paginated token change history with infinite scroll
    - `useGafaelfawrUrl` - Resolve Gafaelfawr URL from repertoire service discovery
  - **Query helpers** (`UserInfoQuery`, `LoginInfoQuery`, `TokenListQuery`) for convenient data access
  - **Mock data** and test utilities for development and testing

  The package integrates with `@lsst-sqre/repertoire-client` for dynamic URL resolution based on service discovery.

### Patch Changes

- Updated dependencies [[`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e), [`8d837f6`](https://github.com/lsst-sqre/squareone/commit/8d837f68b671f2f4ecafd41cc3d97ab4958c0baa), [`5dba6a8`](https://github.com/lsst-sqre/squareone/commit/5dba6a88de1bba974ef796b0b8a5c3cc65803867)]:
  - @lsst-sqre/repertoire-client@0.2.0
