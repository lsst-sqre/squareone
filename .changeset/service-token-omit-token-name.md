---
"@lsst-sqre/gafaelfawr-client": patch
---

Remove `token_name` from the service-token creation path. Gafaelfawr's service
path rejects a token name (`Tokens of type service cannot have a name`), so the
admin `POST {base}/tokens` request must omit it.

- `AdminTokenRequestSchema` / `AdminTokenRequest` no longer define `token_name`.
- `CreateServiceTokenVariables` and `useCreateServiceToken`'s
  `CreateServiceTokenParams` drop `tokenName`, and
  `createServiceTokenMutationConfig` no longer sends `token_name` in the request
  body.

The user-token path (`CreateTokenRequestSchema`, `createToken`,
`useCreateToken`) keeps `token_name`/`tokenName` and is unchanged.
