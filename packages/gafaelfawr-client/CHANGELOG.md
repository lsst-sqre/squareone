# @lsst-sqre/gafaelfawr-client

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
