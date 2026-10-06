---
'@lsst-sqre/gafaelfawr-client': minor
---

Adds the signed-in user's scopes as a query of their own, apart from login info, so a server render can hydrate them from whichever source it has. `userScopesQueryOptions` (key `gafaelfawrKeys.userScopes()`, data `string[] | null`) derives the scopes from the login-info query by default, sharing one `GET /auth/api/v1/login` with every login-info observer; with `source: 'token-info'` it instead reads them from `GET /auth/api/v1/token-info` for the token in the forwarded `authorization` header, which is how a server behind a `GafaelfawrIngress` learns the user's scopes from the delegated internal token the ingress sends, since the ingress strips the session cookie that login info requires. The new `fetchTokenInfo(baseUrl, init)` client function backs that source, and the `useUserScopes(repertoireUrl, config)` hook exposes the query with `scopes` and `hasScope`. Failures degrade to `null` scopes, logged and reported as for login info.
