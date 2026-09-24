---
'squareone': minor
---

On the `/api-aspect` page, each API endpoint now lists the Gafaelfawr scopes its service requires, taken from the service's Repertoire discovery `required_scopes`, as small scope pills under the endpoint URL. For example, TAP shows `read:tap`, and SIA, SODA, and HiPS show `read:image`. Next to the pills, a "Create a token with these scopes" link opens the token creation form at `/settings/tokens/new?scopes=<comma-separated scopes>` with those scopes already selected. An endpoint whose service declares no scopes, such as GMS, shows no pills and no link. The same is true of every endpoint under Repertoire 2.x, which doesn't publish `required_scopes`.

The token template URL offered after creating a token now pre-fills the scopes on the token creation form. The template URL used to repeat a `scope` parameter for each scope, which the form ignored. It now sends one comma-separated `scopes` parameter, as the `/api-aspect` links do. Template URLs copied before this change also work now, because the token creation form reads the older repeated `scope` parameters as well as `scopes` and combines them.
