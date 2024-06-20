---
'squareone': minor
---

Usage of Reach UI is now removed and replaced with Radix UI. The user menu now uses `GafaelfawrUserMenu` from `@lsst-sqre/squared` and is based on Radix UI's Navigation Menu component. It is customized here to work with the Gafaelawr API to show a log in button for the logged out state, and to show the user's menu with a default log out button for the logged in state. Previously we also used Reach UI for showing an accessible validation alert in the Times Square page parameters UI. For now we've dropped this functionality.
