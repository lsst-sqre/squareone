---
"squareone": patch
---

Classify React hydration errors in the client-side Sentry pipeline so browser-extension DOM noise stops drowning out genuine mismatches.

A new pure `hydrationClassifier` module recognises React's recoverable hydration errors (codes 418/419/421/422/423/425 and the "Hydration failed" / "didn't match" message patterns) and, given a snapshot of the `<body>`/`<html>` attribute names, conservatively labels each event `extension`, `in-app`, or `unknown` — only calling it `extension` when a known extension marker (Grammarly, Dark Reader, password managers, etc.) is present alongside a hydration error. A `beforeSend` wrapper wired into `instrumentation-client.js` tags every event with `hydration.classification`, attaches the matched markers plus a body-attribute fingerprint as context, and regroups extension noise under a single mutable Sentry issue via a custom fingerprint. The event is always kept (never dropped), and the wrapper is defensive — it returns the event unchanged if `document` is unavailable or any internal error occurs.
