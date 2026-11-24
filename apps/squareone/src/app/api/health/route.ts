/**
 * Health check endpoint for Kubernetes liveness and readiness probes.
 *
 * `GET /api/health` answers 200 with the running build's identity:
 *
 * ```json
 * { "status": "ok", "version": "0.41.4", "revision": "abc1234" }
 * ```
 *
 * The check is deliberately shallow. It makes no upstream calls (Repertoire,
 * Semaphore, Gafaelfawr) and does not read the YAML app config, so it fails
 * only when the squareone process itself cannot serve requests. The only
 * upstream state the server keeps between renders is about Repertoire service
 * discovery: the last discovery document received, served while Repertoire is
 * unavailable, and a 5-second fail-fast window after a discovery timeout.
 * Neither is a reason to restart: a restart only throws them away and never
 * fixes the upstream service, so liveness must not depend on upstream
 * services. Keep this module's imports to `getAppVersion()` and Next.js
 * itself.
 *
 * The route is unauthenticated: the body publishes nothing beyond what the
 * `squareone:version` and `squareone:revision` meta tags already carry on every
 * page.
 */

import { NextResponse } from 'next/server';

import { getAppVersion } from '@/lib/version';

/**
 * Render on every request. A probe answered from a build-time snapshot would
 * report healthy no matter what the process is doing, and would carry the
 * builder's version rather than the image's (`SQUAREONE_VERSION` is set only in
 * the Dockerfile's runner stage).
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { status: 'ok', ...getAppVersion() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
