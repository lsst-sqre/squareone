import type * as Sentry from '@sentry/nextjs';

/**
 * Options for `Sentry.pinoIntegration()` that bridge server-side pino records
 * to Sentry **Logs** only — never to Sentry issues/events.
 *
 * `pinoIntegration` has two independent channels:
 *
 * - `log.levels` — records at these levels are shipped to Sentry Logs
 *   (structured, searchable, trace-linked) via `_INTERNAL_captureLog`.
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
 * Sentry Structured Logs are server-side only. SDK v11 removed the
 * `enableLogs` option: logs are captured whenever a logging integration is
 * registered or `Sentry.logger.*` is called, and there is no switch to turn
 * them off. This bridge is registered in `sentry.server.config.js` and nowhere
 * else, because it is the only producer of Sentry Logs and it runs only in the
 * Node runtime. The browser (`src/instrumentation-client.js`) and edge
 * (`sentry.edge.config.js`) configs register no logging integration, so keeping
 * them log-free now depends on not calling `Sentry.logger.*` there.
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
