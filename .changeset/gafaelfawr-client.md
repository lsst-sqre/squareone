---
"@lsst-sqre/gafaelfawr-client": minor
---

New `@lsst-sqre/gafaelfawr-client` package for Gafaelfawr authentication API

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
