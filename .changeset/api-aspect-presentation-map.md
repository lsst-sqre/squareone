---
"squareone": patch
---

Layer a curated presentation map onto the discovery-driven `/api-aspect` listing.

Mapped services now render human labels linked to their IVOA standard docs with
the right URL — Simple Image Access (SIA v2) → the `sia-query-2.0` `/query` URL,
HiPS (Hierarchical Progressive Survey) → the `/list` URL, Table Access Protocol
(TAP) and SODA Image Cutouts → their base URLs. Unmapped services (`datalink`,
`gms`, …) keep the skeleton's raw-name + base-URL fallback. Each dataset section
header now shows the display name (e.g. "Data Preview 1") linked to its docs,
followed by the dataset description.

`<ApiEndpoints/>` gains a `headingLevel` prop (default `3`) so MDX authors can
nest the dataset headings under their page's heading hierarchy instead of
colliding with the surrounding section heading.
