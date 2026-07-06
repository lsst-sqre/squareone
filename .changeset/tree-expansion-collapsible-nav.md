---
'squareone': patch
---

The Times Square sidebar navigation tree is now collapsible: every org, repo, and directory row's chevron is a rotating disclosure button (WAI-ARIA disclosure pattern with `aria-expanded`/`aria-controls`), and a toolbar above the tree offers collapse-all and expand-all buttons. Expansion state is owned by a new `useTreeExpansion` hook, keyed by node path and persisted in `sessionStorage` for the browser session, defaulting to all-expanded; the ancestor chain of the currently viewed notebook is always forced open (auto-reveal), even after collapse-all. Also fixes the current-page highlighting to use path-segment-aware matching so sibling paths sharing a string prefix (e.g. `weather` and `weather-archive`) are no longer both highlighted, and current page links now carry `aria-current="page"`.
