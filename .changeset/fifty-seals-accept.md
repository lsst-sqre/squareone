---
'squareone': patch
---

Fix docker-release workflow for missing pnpm setup

pnpm is now required to be present for the docker-release workflow because the root package.json specifies `pnpm` as the packageManager.
