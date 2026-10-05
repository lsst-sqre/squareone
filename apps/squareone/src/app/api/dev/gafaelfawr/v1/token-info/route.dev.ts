/**
 * Mock of the Gafaelfawr token-info endpoint (App Router version)
 * GET /auth/api/v1/token-info (rewritten to /api/dev/gafaelfawr/v1/token-info)
 *
 * Describes the token authenticating the request. The root layout's
 * server-side prefetch of the user's scopes calls this with the delegated
 * token on a GafaelfawrIngress route (see `lib/mocks/devDelegatedToken.ts`
 * for how to simulate one against `next dev`); the answer is an internal
 * token delegated to squareone carrying the `/dev` persona's scopes. Like real
 * Gafaelfawr, the mocked session also authenticates when no bearer token is
 * sent.
 */

import { NextResponse } from 'next/server';

import {
  DEV_DELEGATED_TOKEN_KEY,
  devAuthFor,
} from '@/lib/mocks/devDelegatedToken';
import { getDevState } from '@/lib/mocks/devstate';

export async function GET(request: Request) {
  const { loggedIn, username, scopes } = getDevState();

  const auth = devAuthFor(request, loggedIn);
  if (auth === 'unauthenticated') {
    return new Response('Not logged in', { status: 401 });
  }

  const created = Math.floor(Date.now() / 1000);
  return NextResponse.json({
    username,
    token_type: auth === 'delegated' ? 'internal' : 'session',
    service: auth === 'delegated' ? 'squareone' : null,
    scopes,
    created,
    expires: created + 24 * 60 * 60,
    token: DEV_DELEGATED_TOKEN_KEY,
    token_name: null,
    parent: null,
  });
}
