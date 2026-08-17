/**
 * Admin smoke-test endpoint that emits server-side pino warn and error records.
 *
 * The `Sentry.pinoIntegration()` bridge configured in `sentry.server.config.js`
 * ships these records to Sentry **Logs** (not issues), so hitting this endpoint
 * from the `/admin/sentry` page verifies the pino→Sentry Logs transport in a
 * real server build. The records carry a marker so they are easy to find in the
 * Sentry Logs UI.
 */

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { createRouteLogger } from '@/lib/logger';
import {
  type EmitLogDelivery,
  SMOKE_TEST_LEVELS,
} from '@/lib/sentry/emitLogSmokeTest';

const log = createRouteLogger('admin/sentry/emit-log');

/** How long to wait for the Sentry buffers to drain, in milliseconds. */
const FLUSH_TIMEOUT_MS = 2000;

/**
 * Drain the Sentry buffers and report, honestly, what that achieved.
 *
 * Both non-delivered outcomes would otherwise read as success:
 *
 * - Without a DSN the SDK has no transport, and `Client.flush` short-circuits
 *   on `if (!transport) { return true; }` — a `true` there means "nothing to
 *   send", not "sent".
 * - `Client.flush` resolves `false` (it never rejects, and transport send
 *   errors are swallowed inside the SDK) when the timeout expires, which is
 *   exactly how an unreachable ingest — the failure this smoke test exists to
 *   detect — presents itself.
 *
 * Flushing at all is necessary because Sentry buffers logs in memory and drains
 * them on a 5 s interval, and its only shutdown drain is a `beforeExit`
 * listener that never fires when Next's SIGTERM handler calls `process.exit()`.
 */
async function deliverToSentry(): Promise<EmitLogDelivery> {
  // `isEnabled()` is true only when the client has a transport (which it builds
  // only for a parseable DSN) and was not initialized with `enabled: false` —
  // i.e. exactly when a flush can do anything.
  if (!Sentry.isEnabled()) {
    return 'sentry-disabled';
  }
  return (await Sentry.flush(FLUSH_TIMEOUT_MS)) ? 'delivered' : 'flush-timeout';
}

/**
 * Authorization note: this route handler performs **no** in-app authorization.
 * Access is delegated entirely to the Phalanx `GafaelfawrIngress` that fronts
 * the `/admin` path prefix — the client-side `AdminRequired` gate protects only
 * rendered pages, never route handlers. Any future route handler added under
 * `/admin` inherits the same single-layer assumption, so if that ingress rule
 * ever changes, in-app checks must be added here.
 */
export async function POST() {
  const marker = 'sentry-logs-smoke-test';
  log.warn({ marker }, 'Sentry Logs smoke test (warn)');
  log.error({ marker }, 'Sentry Logs smoke test (error)');

  // pino noops calls below its configured level (e.g. LOG_LEVEL=error silences
  // warn), so report only the levels that actually produced a record.
  const emitted = SMOKE_TEST_LEVELS.filter((level) =>
    log.isLevelEnabled(level)
  );

  const delivery = await deliverToSentry();

  // The status code carries the transport verdict, so a non-browser prober
  // (curl, a monitoring job) sees a failure without parsing the body. The
  // pino level gate is a separate axis, reported in `emitted`.
  return NextResponse.json(
    { delivery, emitted, marker },
    { status: delivery === 'delivered' ? 200 : 503 }
  );
}
