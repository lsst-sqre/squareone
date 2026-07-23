/**
 * Admin smoke-test endpoint that emits server-side pino warn and error records.
 *
 * The `Sentry.pinoIntegration()` bridge configured in `sentry.server.config.js`
 * ships these records to Sentry **Logs** (not issues), so hitting this endpoint
 * from the `/admin/sentry` page verifies the pino→Sentry Logs transport in a
 * real server build. The records carry a marker so they are easy to find in the
 * Sentry Logs UI.
 */

import { NextResponse } from 'next/server';

import { createRouteLogger } from '@/lib/logger';

const log = createRouteLogger('admin/sentry/emit-log');

export async function POST() {
  const marker = 'sentry-logs-smoke-test';
  log.warn({ marker }, 'Sentry Logs smoke test (warn)');
  log.error({ marker }, 'Sentry Logs smoke test (error)');

  return NextResponse.json({ emitted: ['warn', 'error'], marker });
}
