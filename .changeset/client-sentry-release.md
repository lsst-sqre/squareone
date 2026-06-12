---
"squareone": patch
---

Attribute client-side Sentry events to the build's git commit SHA as the
`release`, matching server/edge events.

Browser events previously reported `release: null` because Turborepo's strict
env mode stripped `SENTRY_RELEASE` from the `next build` environment, so the
Sentry bundler plugin never injected a release into the client bundle (the
server/edge SDKs were unaffected — they read `SENTRY_RELEASE` at runtime). Two
complementary fixes:

- Declare `SENTRY_RELEASE` in the `build` task's `env` in `turbo.json` so it
  reaches `withSentryConfig` at build time; the plugin now bakes the release
  into the client bundle and associates uploaded source maps with it. Using
  `env` (not `passThroughEnv`) also keys the build cache on the SHA, so a
  cached bundle baked with an older commit's release is never reused.
- Thread the SHA (`getAppVersion().revision`) through `window.__SENTRY_CONFIG__`
  as `release`, alongside the existing runtime DSN/`version` injection, and use
  it in the client `Sentry.init`. This keeps the client release identical to
  the server's runtime value by construction.

In local dev (no `SENTRY_RELEASE`), both paths degrade gracefully to an unset
release as before.
