---
"squareone": minor
---

Bridge server-side pino warn/error records to Sentry Logs (DM-55604). `sentry.server.config.js` now sets `enableLogs: true` and adds `Sentry.pinoIntegration()`, configured (via `src/lib/sentry/pinoLogsConfig.ts`) to ship pino records to Sentry **Logs** only — the issue-creating `error.levels` channel is left empty, so server-side `logger.warn`/`logger.error` records become searchable, trace-linked structured logs without creating Sentry issues or firing Slack alerts. The explicit `reportError` path remains the sole alerting channel, so there is no double-capture. A new `/admin/sentry/emit-log` route handler emits a warn+error record, and an "Emit server log" button on the `/admin/sentry` page POSTs to it, so the transport can be verified in a real server build.
