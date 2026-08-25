---
"squareone": minor
---

Add the `/admin/oidc-clients/[id]` detail page, completing the OpenID Connect client admin flow. The page shows the client's server-assigned metadata — `client_id` with a copy button, its URL, when it was created and last modified, and by whom — above the same form the creation page uses, now in edit mode, and a Delete button. Editing sends Gafaelfawr's PATCH, which replaces the client's whole updatable state rather than a diff, and confirms inline with refreshed metadata; emptying the notes field clears the notes rather than silently leaving them. Deleting asks for confirmation in a modal that spells out the stakes — a client secret can never be recovered, so a replacement is a different client every relying party must be reconfigured for — and returns to the listing, which no longer includes the client.

The page never shows a client secret: Gafaelfawr discloses it only with the creation response and has no endpoint to rotate it.

Load failures are distinguished the way the listing distinguishes them: an unknown id is a stale link, so it renders a not-found note with a way back rather than a retry that could never succeed; a 403 names the `admin:oidc` scope Gafaelfawr's API requires; anything else gets the message and a retry. Failed saves and deletes render inline — a save keeps the operator's input so a 422 naming a field can be corrected in place, and a failed delete is reported inside the confirmation modal so it can be retried or backed out of. Like the rest of the section, the page is gated on the scopes configured for the `oidcClients` page id.
