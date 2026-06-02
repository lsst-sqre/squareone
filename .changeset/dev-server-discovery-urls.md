---
"squareone": patch
---

Fix the dev-mode Repertoire `/discovery` mock to return absolute service URLs so
they pass URL-schema validation and are fetchable from server components.

- The dev mock route previously overrode internal service URLs (gafaelfawr,
  semaphore, times-square) with bare relative paths (`/auth`, `/semaphore`, …).
  Those failed the repertoire-client `z.string().url()` schema, so
  `DiscoverySchema.parse()` threw a `ZodError` and the app silently fell back to
  empty discovery (no Semaphore broadcasts, etc.).
- Relative paths are also unfetchable during server-side prefetch in
  `RootLayout`, where there is no document origin.
- The mock now prefixes each overridden internal URL with the dev server's own
  origin (derived from the incoming request, so it stays port-agnostic). The
  pathnames are unchanged, so the existing `next.config.js` rewrites still route
  them to the local mock handlers.
