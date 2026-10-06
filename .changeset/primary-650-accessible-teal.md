---
'@lsst-sqre/rubin-style-dictionary': minor
---

Add accessible-teal foundation tokens for the color-contrast work. A new `primary-650` palette step (`#046F70`, 5.98:1 on white) is added between `primary-600` and `primary-700` for text and interactive foregrounds that need to clear the WCAG 4.5:1 bar — `primary-600` (`#058B8C`, the official brand color) is unchanged and remains for non-text accents such as focus rings, borders, and checked-state fills. A new semantic `component.interactive.color` token (`--rsd-component-interactive-color`) resolves to `primary-650` in the light theme (and `primary-400` in dark) so components can migrate off raw `primary-600` references. The headline token (`--rsd-component-text-headline-color`) now points at the body text color (gray-800, `#1F2121`) instead of brand teal, so h1/h2 render black while the teal identity stays in interactive elements and accents.
