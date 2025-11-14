---
'squareone': patch
---

Automate Playwright browser installation in CI

Added automatic Playwright browser installation script that runs during CI setup. This eliminates manual browser installation steps and ensures the correct browser versions are always available for testing.

The installation script detects the CI environment and automatically installs Playwright browsers when needed, improving CI reliability and reducing setup complexity.
