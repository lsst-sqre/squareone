/**
 * Mock of Gafaelfawr user-info endpoint (App Router version)
 * GET /api/dev/user-info
 *
 * Authenticates like real Gafaelfawr: a bearer `Authorization` header, when
 * sent, must be the dev delegated token (how the root layout's server-side
 * prefetch calls this on a simulated GafaelfawrIngress route; see
 * `lib/mocks/devDelegatedToken.ts`); otherwise the mocked session stands in
 * for the session cookie.
 */

import { NextResponse } from 'next/server';

import { devAuthFor } from '@/lib/mocks/devDelegatedToken';
import { getDevState } from '@/lib/mocks/devstate';

export async function GET(request: Request) {
  const { loggedIn, username, name, uid } = getDevState();

  if (devAuthFor(request, loggedIn) === 'unauthenticated') {
    return new Response('Not logged in', { status: 401 });
  }

  return NextResponse.json({ username, name, uid });
}
