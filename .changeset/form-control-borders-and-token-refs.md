---
'@lsst-sqre/squared': patch
'squareone': patch
---

Fix form-control contrast and broken CSS token references for accessibility. Input, textarea, and select borders move from `gray-100` (`#DCE0E3`, 1.33:1 on a white page — a WCAG 1.4.11 non-text contrast failure) to `gray-400` (`#82898B`, 3.56:1). The error/success text in `TextInput`, `TextArea`, and `Select` referenced non-existent ramp steps (`--rsd-color-red-900` / `--rsd-color-green-900`), which silently resolved to nothing; those now point at the real `red-600` (`#AD1919`, 7.17:1) and `green-600` (`#237028`, 6.14:1) text steps. The wrong-hue blue fallback hexes (`#0066cc`, `#e6f3ff`, `#f0f9ff`, `#bfdbfe`) in the SidebarLayout CSS modules are corrected to the teal `primary` ramp values that back the tokens they fall back from.
