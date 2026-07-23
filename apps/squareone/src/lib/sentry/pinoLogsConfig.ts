import type * as Sentry from '@sentry/nextjs';

/**
 * Options for `Sentry.pinoIntegration()` that bridge server-side pino records
 * to Sentry **Logs** only — never to Sentry issues/events.
 *
 * `pinoIntegration` has two independent channels:
 *
 * - `log.levels` — records at these levels are shipped to Sentry Logs
 *   (structured, searchable, trace-linked) via `_INTERNAL_captureLog`, gated
 *   on the client's `enableLogs` option.
 * - `error.levels` — records at these levels are turned into Sentry issues via
 *   `captureException`/`captureMessage`, which can also fire Slack alerts.
 *
 * We keep `error.levels` empty so the bridge never creates an issue or alert:
 * `reportError` (see `./reportError`) remains the sole issue/alerting channel,
 * so a warn/error that is both logged and reported is not double-captured.
 * `warn` and `error` are included in `log.levels` so those records reach
 * Sentry Logs.
 */
export const pinoLogsIntegrationOptions: Parameters<
  typeof Sentry.pinoIntegration
>[0] = {
  // Sentry Logs channel: ship these levels as structured logs.
  log: { levels: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] },
  // Issue-creating channel: intentionally empty so the bridge never opens an
  // issue or fires an alert. Do not populate — see reportError for alerting.
  error: { levels: [] },
};
