---
"squareone": minor
---

Drive the `/api-aspect` endpoint listing from Repertoire service discovery.

The page resolves discovery server-side and renders one section per dataset
(`dp1`/`dp02`/`dp03`), so the endpoints are present in the server-rendered HTML
with no client-side discovery fetch. The listing is embedded via an
`<ApiEndpoints/>` MDX component (with a `headingLevel` prop, default `3`) so
per-environment prose keeps control of the surrounding content. It degrades
gracefully, mirroring the App Router layout's server-side discovery pattern: the
listing is omitted when `repertoireUrl` is unset, and a brief "temporarily
unavailable" notice (plus a server-side log) is shown when the discovery fetch
fails.

A curated presentation map layers human-readable content onto the raw
discovery data:

- Each dataset section header shows the display name (e.g. "Data Preview 1")
  linked to its documentation site, followed by the dataset description and a
  visible "Read the documentation" link sourced from the discovery `docs_url`
  field (with a dataset-named accessible label; omitted when `docs_url` is
  absent).
- Each service name renders as plain, non-clickable text. When a service maps
  to an IVOA standard, a book-icon link beside the name points to the standard's
  documentation with a spec-specific accessible label and tooltip (e.g. "IVOA
  TAP docs", "IVOA SIA docs"). Mapped services use curated labels and the
  correct per-standard URLs (e.g. SIA v2 → the `sia-query-2.0` `/query` URL,
  HiPS → the `/list` URL); unmapped services fall back to their raw name and
  base URL.
- Endpoint base URLs render as copyable monospace code text rather than
  anchors, since they are hit programmatically (TAP clients, notebooks) rather
  than clicked. An icon-only copy-to-clipboard button sits beside each URL with
  a per-endpoint accessible name.
- Each dataset's endpoints render in an aligned two-column layout (label | URL)
  via a CSS grid + subgrid chain, so the URL column starts at the same
  x-position across every dataset, sized by the widest label on the page. On
  mobile (≤768px) each row collapses to a single column with the label stacked
  above its URL.
