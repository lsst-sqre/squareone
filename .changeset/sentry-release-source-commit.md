---
"squareone": patch
---

Stamp the git commit SHA into the Docker image as the Sentry `release`.

The Dockerfile takes a `SOURCE_COMMIT` build arg and exposes it as
`SENTRY_RELEASE` in both the installer stage (so the Sentry bundler plugin marks
client/server bundles and uploads source maps under the SHA) and the runner
stage (so server/edge `Sentry.init` reports it at runtime); it also records the
SHA in the `org.opencontainers.image.revision` OCI label. `next.config.js`,
`sentry.server.config.js`, and `sentry.edge.config.js` now read
`process.env.SENTRY_RELEASE`. Server/edge/client events carry the build's SHA
instead of `null`, and the value degrades gracefully to no release when
`SENTRY_RELEASE` is unset (e.g. local `pnpm dev`/`pnpm build`).
