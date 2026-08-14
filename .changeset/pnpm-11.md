---
"squareone": patch
---

Upgrade pnpm from 10.20.0 to 11.21.0. The squareone Docker image now builds under pnpm 11 with a rewritten lockfile, and the security overrides moved from package.json to pnpm-workspace.yaml (the only location pnpm 11 reads), which activates them for the first time.
