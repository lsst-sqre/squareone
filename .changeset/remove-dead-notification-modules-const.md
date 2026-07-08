---
'@lsst-sqre/repo-scripts': patch
---

Remove the unused `NOTIFICATION_CSS_MODULES` constant from `validate-theme-tokens`. The scan is entirely glob-driven via `SCAN_ROOTS`/`scannedModules()`, so this list scoped nothing and was misleading dead code. No behavioral change.
