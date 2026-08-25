---
"squareone": minor
---

Add the `/admin/oidc-clients/new` page for registering an OpenID Connect client with this environment's Gafaelfawr. The form asks for a return URI (required, and validated client-side as an absolute URL, since a redirect target without a scheme is meaningless outside the browser that typed it), a description (required), and optional notes. Like the listing, the page is gated on the scopes configured for the `oidcClients` page id, and the form is additionally disabled — with an explanatory note — for anyone whose scopes would make every submit a 403.

On success the form is replaced by a one-shot view showing the new `client_id` and `client_secret`, each with a copy button, warning that the secret cannot be shown again. Gafaelfawr returns the secret only with the 201 and has no endpoint to rotate it, so the view replaces the form rather than floating over it as a dismissable modal: the only ways past it are the two links out of it, to the client's detail page or back to the listing. The secret lives in component state alone and is gone on reload.

A failed submit renders inline without discarding the operator's input, so a 422 naming a field can be corrected in place; the message is Gafaelfawr's own, except for a 403 (which names the `admin:oidc` scope the API requires) and a 404 (which explains that this environment has no OpenID Connect server).
