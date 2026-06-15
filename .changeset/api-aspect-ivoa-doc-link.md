---
"squareone": patch
---

Render `/api-aspect` service names as plain text with a separate "IVOA doc" link.

A service name is now always plain text — a stable, non-clickable identifier —
rather than a link. When a service maps to an IVOA standard, a small book icon
appears beside the name and is the link to the standard's documentation. The icon
link carries hover and accessible text "IVOA doc" so it reads clearly as a link to
an IVOA document. Services without an IVOA standard (DataLink, GMS) show no icon.
