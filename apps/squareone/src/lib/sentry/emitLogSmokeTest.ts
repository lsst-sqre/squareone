/**
 * Shared contract for the `/admin/sentry/emit-log` smoke test.
 *
 * The route handler emits pino records and reports how they fared; the
 * "Emit server log" button on `/admin/sentry` reads that report back and turns
 * it into an operator-facing status line. Next validates a `route.ts` module's
 * export surface, so the route file cannot host shared values itself — they
 * live here, alongside the rest of the app's Sentry helpers.
 */

/**
 * Levels the smoke test attempts to emit, in response order.
 *
 * Both sides need this list: the route filters it through pino's level gate to
 * build `emitted`, and the readout subtracts `emitted` from it to name the
 * levels that were gated out.
 */
export const SMOKE_TEST_LEVELS = ['warn', 'error'] as const;

export type SmokeTestLevel = (typeof SMOKE_TEST_LEVELS)[number];

/**
 * Path of the smoke-test route handler, as the browser requests it.
 *
 * Mirrors the location of `app/admin/sentry/emit-log/route.ts`. The button
 * POSTs here and the story stubs this URL, so a moved route directory is a
 * one-line fix rather than a hunt through the component and its fixtures.
 */
export const EMIT_LOG_PATH = '/admin/sentry/emit-log';

/**
 * Marker attached to every record the smoke test emits.
 *
 * These records deliberately never become Sentry issues, so this string is the
 * only handle an operator has for finding them in the Sentry Logs UI — which
 * makes it a published contract with humans, not just between modules. The
 * route stamps it onto the pino records and echoes it in the response; the
 * readout quotes it back as the search term.
 */
export const SMOKE_TEST_MARKER = 'sentry-logs-smoke-test';

/**
 * What became of the emitted records on their way to Sentry.
 *
 * The three outcomes are distinct on purpose: two of them can otherwise
 * masquerade as success, because `Client.flush()` resolves `true` when there is
 * no transport at all and `false` (rather than rejecting) when the ingest is
 * unreachable.
 *
 * - `delivered` — the flush completed, so the records left the process.
 * - `flush-timeout` — the flush timed out; the records may never have reached
 *   Sentry Logs.
 * - `sentry-disabled` — the SDK has no transport (usually no `SENTRY_DSN`), so
 *   the records only ever went to the local log.
 */
export type EmitLogDelivery = 'delivered' | 'flush-timeout' | 'sentry-disabled';

const EMIT_LOG_DELIVERIES: readonly EmitLogDelivery[] = [
  'delivered',
  'flush-timeout',
  'sentry-disabled',
];

/**
 * Narrow an unknown response field to a known delivery outcome.
 *
 * A body that fails this check is not this route's response (a proxy
 * interstitial, say), which the readout reports differently from a delivery
 * verdict it actually understands.
 */
export function isEmitLogDelivery(value: unknown): value is EmitLogDelivery {
  return (
    typeof value === 'string' &&
    (EMIT_LOG_DELIVERIES as readonly string[]).includes(value)
  );
}
