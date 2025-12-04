---
"@lsst-sqre/squared": patch
---

Fix outline+tertiary Button hover state readability

The `appearance="outline" tone="tertiary"` Button hover state now uses a subtle 10% opacity background instead of a solid background that made the label illegible on hover. This hover style works dynamically across any context (white text on blue, red, orange backgrounds).
