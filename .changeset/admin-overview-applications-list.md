---
"squareone": patch
---

Correct the `/admin` overview's Applications section. It was a table that joined each Phalanx application to the Repertoire UI and API services of the same name, plus a hand-maintained alias map, but discovery's `applications` list and its `services` maps are separate namespaces: many services belong to no application of the same name, so the joined rows were misleading. The section is now a compact, alphabetical, multi-column list of the enabled applications with a count, each linking to its page in the Phalanx documentation (`https://phalanx.lsst.io/applications/<name>/`), and it says "Service discovery lists no applications." when discovery lists none. The table's filter and per-application service details are gone.
