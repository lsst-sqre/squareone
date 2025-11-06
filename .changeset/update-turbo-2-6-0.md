---
'squareone': patch
---

Update Turborepo from 2.5.6 to 2.6.0

This infrastructure update brings the latest improvements and bug fixes from Turborepo 2.6.0. Updated packages:
- `turbo` from 2.5.6 to 2.6.0
- `@turbo/gen` from 1.13.4 to 2.6.0

The global turbo installation has been removed as it's not needed for this monorepo workflow - all commands use the local installation via `turbo-wrapper.js`.
