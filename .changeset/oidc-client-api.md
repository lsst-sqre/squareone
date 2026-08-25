---
"@lsst-sqre/gafaelfawr-client": minor
"squareone": minor
---

Add the OpenID Connect client API surface to `@lsst-sqre/gafaelfawr-client`: `OIDCClientSchema`, `OIDCClientWithSecretSchema`, and `OIDCClientUpdateSchema`; the `fetchOidcClients` / `fetchOidcClient` / `createOidcClient` / `updateOidcClient` / `deleteOidcClient` functions; `oidcClientsQueryOptions` and `oidcClientQueryOptions` with the `['gafaelfawr', 'oidc-clients', url]` and `['gafaelfawr', 'oidc-client', url, id]` keys; the matching create/update/delete mutation configs; and the `useOidcClients`, `useOidcClient`, `useCreateOidcClient`, `useUpdateOidcClient`, and `useDeleteOidcClient` hooks. All calls send session credentials, mutations carry `x-csrf-token`, and failures surface as `GafaelfawrError` with the HTTP status.

Gafaelfawr overloads 404 on this API, so the collection endpoints raise a distinguishable `OidcNotConfiguredError` ("this environment has no OpenID Connect server") while a per-client 404 stays an ordinary "no such client". `useOidcClients` exposes that as `isNotConfigured`, and `useOidcClient` exposes `isNotFound`. Unlike the ambient auth queries, these queries reject rather than degrading to a fallback — the admin UI has to tell "not configured" from "you lack `admin:oidc`" from "the request failed" — while still routing report-worthy failures through the shared `classifyError` / `reportError` path, and they do not retry 4xx responses.

The package's vendored `openapi.json` is refreshed from the Gafaelfawr spec, and `fetch-openapi` temporarily points at `data-dev.lsst.cloud` — the OIDC client API has not reached `data.lsst.cloud` yet, so the script must move back once the release lands.

`formatValidationError` now renders a location-less error as its bare message instead of prefixing it with `unknown:`, which Gafaelfawr's `ErrorModel` produces for whole-request errors such as a 403.

The squareone dev server gains mocks for the new endpoints — `/auth/api/v1/oidc-clients` and `/auth/api/v1/oidc-clients/:clientId` rewrites backed by an in-memory store seeded from the package's shared fixtures, with a generated `client_secret` on create — and the `/dev` panel now lists `admin:oidc`, on by default, so the whole create/read/update/delete cycle (and its 403, 404, and 422 paths) is exercisable without a live Gafaelfawr.
