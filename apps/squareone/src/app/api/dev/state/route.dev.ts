/**
 * Dev state read endpoint (App Router version)
 * GET /api/dev/state
 *
 * Returns the full mutable `DevState` so the `/dev` auth control panel can
 * populate its controls (logged-in toggle, identity fields, scope checklist)
 * on mount. There is no production analogue: this is dev-only tooling.
 */

import { NextResponse } from 'next/server';

import { getDevState } from '../../../../lib/mocks/devstate';

export async function GET() {
  return NextResponse.json(getDevState());
}
