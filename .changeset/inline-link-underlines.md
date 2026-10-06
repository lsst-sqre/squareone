---
'@lsst-sqre/rubin-style-dictionary': patch
'@lsst-sqre/global-css': patch
'squareone': patch
---

Underline links within text blocks and darken the link-hover color for WCAG contrast and identifiability. Links inside running prose (paragraphs, list items, definitions, block quotes rendered in `MainContent`) and all footer links are now underlined so they are distinguishable from surrounding body text by more than color alone (WCAG 1.4.1; resolves the axe `link-in-text-block` failure on prose pages). Nav, menu, card-as-link, and standalone call-to-action links remain underline-free. The light-theme link-hover color (`--rsd-component-text-link-hover-color`) retargets from `blue-500` (`#1c81a4`, 4.44:1 on white — failing) to `blue-600` (`#145f7a`, 7.12:1), clearing the 4.5:1 bar.
