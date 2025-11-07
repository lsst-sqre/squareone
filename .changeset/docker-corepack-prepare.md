---
'squareone': patch
---

Pre-install pnpm in Docker base image to eliminate startup download

The Dockerfile now uses `corepack prepare pnpm@10.20.0 --activate` in the base stage to download and cache pnpm during the image build. This eliminates the "Corepack is about to download..." message and network request that previously occurred on every container startup.

This improves container startup time and reliability, especially in environments with restricted network access.
