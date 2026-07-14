---
'@lsst-sqre/rubin-style-dictionary': patch
'@lsst-sqre/global-css': patch
'@lsst-sqre/squared': patch
---

Migrate teal text and interactive foregrounds onto the accessible-teal semantic token so they clear the WCAG 4.5:1 contrast bar. The failing consumers now reference `--rsd-component-interactive-color` (accessible teal, `primary-650`) instead of the raw brand `primary-600` (4.14:1 on white): Button `solid`/`text`/`outline` primary variants, Badge solid/soft/outline primary, the selected Tabs label, the Select selected-option indicator, the DataTable active-sort indicator, the header dropdown `menulist-selected-background-color` (light theme), the `--sqo-primary-button-background-color` fill behind IconPill, and the BroadcastBanner info category. `primary-600` is retained for non-text accents (focus rings, borders, checked-state fills, the sidebar selected-state left bar) where the 3:1 non-text bar applies and its value is unchanged.
