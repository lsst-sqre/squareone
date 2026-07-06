---
'squareone': patch
---

Org, repo, and directory rows in the Times Square sidebar now show a kebab (⋯) button on hover and keyboard focus that opens a menu with a "Focus on this organization/repository/directory" action. The action links to the current page with `ts_nav_focus` set to that node's path, switching the sidebar to the rooted-subtree focus view; container rows inside a focused view offer the same menu to focus deeper. The menu is fully keyboard operable (the kebab stays in the tab order while visually hidden, and Escape closes the menu and restores focus). The PR-preview tree shows no kebab or focus UI.
