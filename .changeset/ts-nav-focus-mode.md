---
'squareone': minor
---

The Times Square sidebar now supports a linkable focus mode driven by a `ts_nav_focus=<node path>` query parameter. When set, the focused org, repo, or directory renders as the root of the tree beneath a breadcrumb of its ancestors: each ancestor crumb refocuses up to that node (the focused node's own tree row serves as the final crumb) and a clear (✕) control removes focus and restores the full tree. Sidebar page links propagate the parameter so focus survives navigating between notebooks, making focused URLs shareable and reproducible. A stale or invalid focus path resolves to the nearest existing ancestor in the tree (full tree if nothing matches). `ts_nav_focus` joins the reserved `ts_` namespace — it (and any other `ts_`-prefixed parameter) is excluded from notebook parameters. Focus mode applies to the main tree only; the PR-preview tree ignores the parameter.
