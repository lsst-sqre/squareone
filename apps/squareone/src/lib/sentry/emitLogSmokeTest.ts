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
