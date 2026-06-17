# scripts/

Bootstrap scripts that have to run *before or around* the workspace toolchain
itself. They are invoked by raw `node` (never through Turborepo) and cannot
depend on workspace packages being installed or built.

| Script | Used by | Why it lives here |
| --- | --- | --- |
| `turbo-wrapper.js` | every root `pnpm` script that runs Turborepo | Wraps `turbo` to inject remote-cache auth. It is the entry point *to* the toolchain, so it can't run through it. |
| `install-playwright.js` | the root `prepare` lifecycle script | Runs during `pnpm install`, before any package is built. |

## scripts/ vs. `packages/repo-scripts`

Reach for **`packages/repo-scripts`** (`@lsst-sqre/repo-scripts`) for any new
repository maintenance or validation script. As a regular private workspace
package it gets the standard per-package Vitest convention for free, so its
logic is covered by `pnpm test` / Turborepo automatically. Examples already
there: `check-openapi-drift.js` and `validate-docker-versions.js`.

Add a script to **`scripts/`** only when it genuinely can't live in a workspace
package — i.e. it bootstraps the toolchain (like the two above) and so must be
runnable by bare `node` without the workspace being installed or built.

Rule of thumb: if the script has testable logic and runs as part of normal
development or CI, put it in `packages/repo-scripts`. If it has to run to make
the workspace usable in the first place, it belongs here.
