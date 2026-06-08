---
"squareone": patch
---

Drop the token-name field from the service-token creation flow. Gafaelfawr's
service path rejects a `token_name`, so creating a service token previously
422'd with `Tokens of type service cannot have a name`; the form no longer
collects one.

- `ServiceTokenForm` removes the "Token name" field and the `name` form value.
- `ServiceTokenPageClient` no longer passes a token name to `createServiceToken`
  or `TokenSuccessModal`.
- `TokenSuccessModal`'s `tokenName` prop is now optional; the user-token flow
  under `/settings/tokens` is unchanged.
