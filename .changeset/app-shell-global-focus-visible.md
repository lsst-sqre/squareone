---
'@lsst-sqre/global-css': patch
---

Add a sitewide `:focus-visible` baseline so every interactive element has a visible keyboard focus indicator (WCAG 2.4.7 / 2.4.11). The base stylesheet now draws a 2px solid outline in the `--rsd-color-primary-500` token color with a 2px offset on any element matching `:focus-visible`. Scoping the rule to `:focus-visible` (rather than `:focus`) means pointer/mouse interaction draws no ring, while keyboard users always see where focus is — even on elements a component author forgot to style. Components may still override with a stronger treatment.
