/**
 * Mock of the Gafaelfawr login-info endpoint (App Router version)
 * GET /auth/api/v1/login (rewritten to /api/dev/login-info)
 *
 * Returns the CSRF token, the active session scopes, and the full list of
 * available scopes, matching `LoginInfoSchema` so `useLoginInfo()` and
 * `query.hasScope()` work in development. The active scopes come from the
 * mutable dev state, so the `/dev` control panel can flip personas and scopes
 * at runtime.
 */

import { NextResponse } from 'next/server';

import { AVAILABLE_SCOPES } from '../../../../lib/mocks/devScopes';
import { getDevState } from '../../../../lib/mocks/devstate';

/** Static CSRF token for the mocked session. */
const DEV_CSRF_TOKEN = 'mock-csrf-token-abc123def456';

export async function GET() {
  const { loggedIn, username, scopes } = getDevState();

  if (!loggedIn) {
    return new Response('Not logged in', { status: 401 });
  }

  return NextResponse.json({
    csrf: DEV_CSRF_TOKEN,
    username,
    scopes,
    config: {
      scopes: AVAILABLE_SCOPES,
    },
  });
}
