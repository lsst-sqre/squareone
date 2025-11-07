---
'squareone': patch
---

Use local turbo via pnpm in Dockerfile

The Dockerfile now uses `pnpm dlx turbo@2.6.0` instead of a globally installed turbo package. This:
- Removes the `npm install -g turbo` step from the base image
- Uses the exact turbo version (2.6.0) consistently via pnpm dlx
- Copies the `scripts/` directory to ensure `turbo-wrapper.js` is available for remote caching
- Aligns Docker builds with the local development workflow that uses pnpm scripts

This change makes the Docker build process more consistent with local development and reduces the base image size.
