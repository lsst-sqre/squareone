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
 * `log.levels` is a severity floor at `warn`: `warn`, `error`, and `fatal` all
 * reach Sentry Logs, while the chattier `info`/`debug`/`trace` levels stay out
 * so the Logs stream is not flooded.
 *
 * Sentry Structured Logs are enabled server-side only: `enableLogs: true` lives
 * in `sentry.server.config.js` and nowhere else, because this bridge is the
 * only producer of Sentry Logs and it runs only in the Node runtime. The
 * browser (`instrumentation-client.js`) and edge (`sentry.edge.config.js`)
 * configs deliberately leave `enableLogs` unset. Note that the SDK drops
 * `Sentry.logger.*` calls silently when `enableLogs` is off, so a runtime that
 * ever needs to log to Sentry must turn it on in its own config first.
 *
 * The exported type is wrapped in `NonNullable<>` because
 * `pinoIntegration`'s parameter is optional, so
 * `Parameters<typeof Sentry.pinoIntegration>[0]` alone includes `undefined` —
 * which would make property access on this constant an error once
 * `strictNullChecks` is re-enabled.
 */
export const pinoLogsIntegrationOptions: NonNullable<
  Parameters<typeof Sentry.pinoIntegration>[0]
> = {
  // Sentry Logs channel: ship these levels as structured logs.
  log: { levels: ['warn', 'error', 'fatal'] },
  // Issue-creating channel: intentionally empty so the bridge never opens an
  // issue or fires an alert. Do not populate — see reportError for alerting.
  error: { levels: [] },
};
