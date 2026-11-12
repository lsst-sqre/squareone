---
"squareone": patch
---

Migrate to the Sentry JavaScript SDK v11. `withSentryConfig` is now imported from `@sentry/nextjs/config`, and the removed `enableLogs` and `hideSourceMaps` options are gone (server-side pino logs still reach Sentry Logs through `pinoIntegration`). Every `Sentry.init()` now sets an explicit `dataCollection` baseline matching the v10 defaults, so the SDK's new permissive defaults do not start sending cookies, user info, or request and response bodies to Sentry.
