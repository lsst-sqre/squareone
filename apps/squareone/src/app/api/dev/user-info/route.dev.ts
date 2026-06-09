/**
 * Mock of Gafaelfawr user-info endpoint (App Router version)
 * GET /api/dev/user-info
 */

import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';

export async function GET() {
  const { loggedIn, username, name, uid } = getDevState();

  if (!loggedIn) {
    return new Response('Not logged in', { status: 401 });
  }

  return NextResponse.json({ username, name, uid });
}
