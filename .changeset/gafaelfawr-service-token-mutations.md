---
"@lsst-sqre/gafaelfawr-client": minor
---

Add a service-token mutation stack mirroring the user-token one, for creating
Gafaelfawr **service** tokens via the admin endpoint.

- `AdminTokenRequestSchema` / `AdminTokenRequest` — request schema for the admin
  endpoint (`username`, `token_type: "service"`, `token_name`, `scopes`,
  optional `expires` and identity metadata `name`/`email`/`uid`/`gid`/`groups`),
  reusing the existing `{ token }` `CreateTokenResponseSchema`.
- `createServiceToken(request, csrfToken, baseUrl)` — `POST {base}/tokens` (the
  admin route, not the per-user `{base}/users/{username}/tokens`) with an
  `x-csrf-token` header.
- `createServiceTokenMutationConfig` + `useCreateServiceToken()` — the hook
  sources the CSRF token from `useLoginInfo`, surfaces failures as
  `TokenCreationError`, and invalidates the bot user's token list on success.
