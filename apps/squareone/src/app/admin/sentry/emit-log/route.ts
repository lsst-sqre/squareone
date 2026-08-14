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

const log = createRouteLogger('admin/sentry/emit-log');

/** Levels this smoke test attempts to emit, in response order. */
const SMOKE_TEST_LEVELS = ['warn', 'error'] as const;

/** How long to wait for the Sentry buffers to drain, in milliseconds. */
const FLUSH_TIMEOUT_MS = 2000;

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

  // Sentry buffers logs in memory and drains them on a 5 s interval; its only
  // shutdown drain is a `beforeExit` listener that never fires when Next's
  // SIGTERM handler calls `process.exit()`. Flush before responding so a 200
  // means "delivered", not merely "queued".
  await Sentry.flush(FLUSH_TIMEOUT_MS);

  return NextResponse.json({ emitted, marker });
}
