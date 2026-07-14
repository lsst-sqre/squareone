---
'@lsst-sqre/squared': patch
---

Move the danger/notice colors onto darker ramp steps so their white and colored text clears the WCAG 4.5:1 contrast bar. Button danger variants now use `red-600` (`#ad1919`, 7.17:1 on white) instead of `red-500` (`#ed4c4c`, 3.66:1), with hover/active darkening to `red-700`/`red-800`. The Button solid-primary hover now darkens to `primary-700` (white text 10.07:1) rather than brightening to `primary-400` (which dropped white text to 2.40:1). The outage broadcast banner moves to `red-600` and the notice banner to `orange-600` (`#8f4d0a`, 6.49:1); the BroadcastBanner link-hover `#dddddd` dim is removed so links stay white and above 4.5:1 on the banner background.
