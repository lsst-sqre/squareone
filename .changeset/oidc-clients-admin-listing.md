---
"squareone": minor
---

Add the `/admin/oidc-clients` listing page, which lists the OpenID Connect clients registered with this environment's Gafaelfawr. Each client shows its description — linking to that client's detail page — alongside who last modified it when, with its `client_id` and `return_uri` on a full-width row beneath, and a "New client" button leads to the creation flow. The page appears in the admin sidebar as "OIDC clients", after "Service tokens", for anyone holding the scopes configured for the `oidcClients` page id (`admin:oidc` by default).

Gafaelfawr's failures on this API are not interchangeable, so the page distinguishes them. A 404 means the environment has no OpenID Connect server configured at all, which is a deployment fact rather than a fault: it renders as an informational note, with no retry that could never succeed. A 403 means Gafaelfawr disagrees with the `adminPageScopes` mapping that admitted the reader, so it names the `admin:oidc` scope the API itself requires. Anything else — a 5xx, a network failure — gets the message and a retry button.
