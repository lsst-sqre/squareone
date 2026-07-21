---
'@lsst-sqre/rubin-style-dictionary': patch
'squareone': patch
---

Fix dark-theme input border and link-hover contrast for accessibility. The dark `link-hover-color` re-used the light-theme resting link color (`#146685`), which measures only 2.52:1 on the dark page (gray-800 `#1F2121`) and is *darker* than the resting dark link (blue-300 `#7BCFE8`, 9.19:1) — the wrong direction for a hover affordance. It now retargets to blue-200 (`#B8E3F2`, 11.80:1 on the dark page), lighter than the resting link and well above 4.5:1. The Times Square parameter text input (`StringInput`) border moves from fixed `gray-500` (`#6A6E6E`, a marginal 3.13:1 on the dark page) to `gray-400` (`#82898B`, 4.55:1 on dark and 3.56:1 on white), matching the sibling squared form controls and clearing the 3:1 non-text bar in both themes. Dark-theme placeholder text was already migrated to the adaptive `--rsd-component-text-secondary-color` token (gray-300, 6.45:1 on the dark page).
