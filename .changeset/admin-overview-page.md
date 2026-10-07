---
'squareone': minor
---

`/admin` is now an overview of the environment, built from Repertoire service discovery, instead of a redirect to the first admin page you can see. The admin sidebar lists "Overview" first for everyone who can reach the admin section, whichever page scopes they hold, and the header's "Admin" link lands there.

The overview opens with the environment's Phalanx label, name, title, and description, with a link to its Phalanx documentation ("Phalanx idfdev documentation"). Environments still on Repertoire 2.x, which publish only the environment's name, show just that name. Without a `repertoireUrl`, the page says that service discovery is not configured; if discovery can't be loaded, it shows a warning with a button to try again.

Below it, the Operator links section has cards for Argo CD, Chronograf, and Kafdrop (each only when discovery lists it, with a link to the tool's own documentation when there is one), the environment's Phalanx documentation, and the new `/admin/discovery` page. The Applications section is a table of every enabled Phalanx application, joined to the UI and API services it publishes, including known name mismatches such as `nublado` and its `nublado-controller` API. Each application is a name row, which the table sorts by, over a detail row with the service title, each UI or API service's URL beside the scopes that service requires, and documentation and OpenAPI links, so long URLs wrap within the content column instead of widening the table. A filter narrows the table by name or title.

The Datasets section lists the datasets discovery describes the same way: a name row over a detail row with the dataset's description, the data services it exposes, and links to its documentation, Butler configuration, and ObsCore configuration where it has them. The InfluxDB databases section lists each database's name, flagging those local to the environment, over a detail row with its database, URL, schema registry, and credentials URL with a button to copy it; the overview never fetches the credentials themselves. Each section says so when discovery lists none.

The overview needs no new configuration: it has no `adminPageScopes` page id and is gated only by the admin section's existing check that you can reach at least one admin page.

A new `/admin/discovery` page shows the raw Repertoire service discovery document as pretty-printed, syntax-highlighted JSON, with line numbers and a button that copies the JSON. It links to the document's URL, notes that Squareone caches service discovery for 5 minutes, and has a Refetch button that loads the latest document from Repertoire. The admin sidebar lists "Service discovery" last for everyone who can reach the admin section. Like the overview, the page needs no new configuration, says so when service discovery is not configured, and warns, with a button to try again, when discovery can't be loaded.

Pages with a sidebar, such as the admin and settings pages, no longer scroll sideways when their content has an unbreakable line wider than the content column, such as a code block's long lines; the content scrolls within itself instead.
