---
"squareone": minor
---

Add `/admin/service-tokens` admin pages for creating and managing Gafaelfawr service tokens. The pages live in the admin section, so they inherit its `exec:admin` gate.

- **Landing** (`/admin/service-tokens`) explains service tokens — machine access not tied to a user account — links to the [Gafaelfawr docs](https://gafaelfawr.lsst.io/user-guide/service-tokens.html), and offers entry points to create or look up tokens.
- **Create** (`/admin/service-tokens/new`) provides a form for the bot username, scopes, expiration, and optional identity metadata (name/email/uid/gid/groups) under collapsible Advanced settings. The form is pre-fillable from query parameters (e.g. `?username=`, `?scopes=`, `?expiration=`). Creating a token also requires the `admin:token` scope; an admin without it sees a warning and a disabled form rather than a silent failure.
- **Look up** (`/admin/service-tokens/search`) is URL-driven via `?q=<bot-username>`, listing that bot user's service tokens (each revocable) so a lookup can be bookmarked and shared.
