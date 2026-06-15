---
"squareone": patch
---

Render `/api-aspect` endpoint URLs as copyable code text instead of links.

Endpoint base URLs are hit programmatically (TAP clients, notebooks), not by
clicking in a browser, so each URL now renders as plain monospace code text
rather than an anchor. An icon-only copy-to-clipboard button sits beside each
URL, with a per-endpoint accessible name (e.g. "Copy the Table Access Protocol
(TAP) endpoint URL to the clipboard"). Dataset-heading docs links and curated
label → IVOA standard links are unchanged.
