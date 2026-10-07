---
'squareone': minor
---

`/admin` is now an overview of the environment, built from Repertoire service discovery. This page provides links to key operations apps like Argo CD, information about the applications deployed in the environment, along with available datasets and any InfluxDB database.

A new `/admin/discovery` page shows the raw Repertoire service discovery document as pretty-printed, syntax-highlighted JSON, with line numbers and a button that copies the JSON. It links to the document's URL, notes that Squareone caches service discovery for 5 minutes, and has a Refetch button that loads the latest document from Repertoire. The admin sidebar lists "Service discovery" last for everyone who can reach the admin section. Like the overview, the page needs no new configuration, says so when service discovery is not configured, and warns, with a button to try again, when discovery can't be loaded.
