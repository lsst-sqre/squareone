---
'squareone': minor
---

`/admin` is now an overview of the environment, built from Repertoire service discovery, instead of a redirect to the first admin page you can see. The admin sidebar lists "Overview" first for everyone who can reach the admin section, whichever page scopes they hold, and the header's "Admin" link lands there.

The overview's Environment section is titled by the environment's long title and lists its Phalanx label, name, and description, with a link to its Phalanx documentation. Environments still on Repertoire 2.x, which publish only the environment's name, show just that name. Without a `repertoireUrl`, the page says that service discovery is not configured; if discovery can't be loaded, it shows a warning with a button to try again.

Below it, the Operator links section has cards for Argo CD, Chronograf, and Kafdrop (each only when discovery lists it, with a link to the tool's own documentation when there is one), the environment's Phalanx documentation, and the raw discovery document. The Applications section is a table of every enabled Phalanx application, joined to the UI and API services it publishes, including known name mismatches such as `nublado` and its `nublado-controller` API: each row shows the service title, whether it offers a UI, an API, or both, its URLs, documentation and OpenAPI links, and the scopes it requires. The table sorts by name, title, or kind, and a filter narrows it by name or title.

The overview needs no new configuration: it has no `adminPageScopes` page id and is gated only by the admin section's existing check that you can reach at least one admin page.
