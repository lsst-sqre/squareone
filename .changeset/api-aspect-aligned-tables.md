---
"squareone": patch
---

Align the `/api-aspect` endpoint listing into per-dataset tables.

Each dataset's endpoints now render as an aligned two-column layout (label |
URL) instead of ragged flex rows. The label column shares one width across every
dataset via a CSS grid + subgrid chain, so the URL column starts at the same
x-position in every section, sized by the widest label on the page. On mobile
(≤768px) each row collapses to a single column with the label stacked above its
URL. This is a CSS-only change — no markup, accessible names, or hrefs changed.
