---
'squareone': patch
---

Update the pinned package manager from pnpm 11.21.0 to pnpm 12.3.4 in `packageManager`, the `engines` range, and the Docker image's corepack setup. The Docker base stage now runs pnpm once after preparing it so that pnpm 12's native binary is cached for the network-restricted runtime stage.
