---
'squareone': minor
---

`/admin` is now an overview of the environment, built from Repertoire service discovery, instead of a redirect to the first admin page you can see. The admin sidebar lists "Overview" first for everyone who can reach the admin section, whichever page scopes they hold, and the header's "Admin" link lands there.

The overview's Environment section is titled by the environment's long title and lists its Phalanx label, name, and description, with a link to its Phalanx documentation. Environments still on Repertoire 2.x, which publish only the environment's name, show just that name. Without a `repertoireUrl`, the page says that service discovery is not configured; if discovery can't be loaded, it shows a warning with a button to try again.

The overview needs no new configuration: it has no `adminPageScopes` page id and is gated only by the admin section's existing check that you can reach at least one admin page.
