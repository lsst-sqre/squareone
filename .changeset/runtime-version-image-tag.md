---
"squareone": patch
---

Make the app's runtime `version` reflect the container image tag.

The Dockerfile exposes the `VERSION` build arg as a `SQUAREONE_VERSION` runtime
env in the runner stage, and `getAppVersion()` now reports it as `version` —
the branch-derived tag for PR/branch builds (e.g. `tickets-DM-55226`), the
release version for releases — falling back to the `package.json` version when
unset (local `pnpm dev`/`pnpm build`). This flows to the `<head>`
`squareone:version` meta tag and the `version` field bound on every server log
record, and is reported to Sentry as a `build` context (server, edge, and
client). Previously these all showed the stale `package.json` version on branch
builds.
