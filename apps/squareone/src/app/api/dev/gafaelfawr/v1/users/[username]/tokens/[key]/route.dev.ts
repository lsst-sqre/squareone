/**
 * Mock of the Gafaelfawr per-user single-token endpoint.
 * GET    /auth/api/v1/users/:username/tokens/:key  (detail)
 * DELETE /auth/api/v1/users/:username/tokens/:key  (revoke)
 * (rewritten to /api/dev/gafaelfawr/v1/users/:username/tokens/:key)
 *
 * GET returns a single `TokenInfo` from the persistent dev store, or 404 when
 * the key is unknown, so the `/settings/tokens/:key` detail page — and its
 * not-found handling — are exercisable. DELETE revokes the token from the store
 * so the list's delete flow works end-to-end without a live Gafaelfawr.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';
import {
  deleteDevUserToken,
  getDevUserTokenByKey,
} from '@/lib/mocks/userTokensStore';
import { forbiddenIfNotSelf } from '../authz.dev';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string; key: string }> }
) {
  const { loggedIn } = getDevState();
  if (!loggedIn) {
    return new Response('Not logged in', { status: 401 });
  }

  const { username, key } = await params;
  const decodedUsername = decodeURIComponent(username);
  const forbidden = forbiddenIfNotSelf(decodedUsername);
  if (forbidden) {
    return forbidden;
  }

  const token = getDevUserTokenByKey(decodedUsername, key);

  if (!token) {
    return NextResponse.json(
      { error: `Token ${key} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(token);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ username: string; key: string }> }
) {
  const { loggedIn } = getDevState();
  if (!loggedIn) {
    return new Response('Not logged in', { status: 401 });
  }

  const { username, key } = await params;
  const decodedUsername = decodeURIComponent(username);
  const forbidden = forbiddenIfNotSelf(decodedUsername);
  if (forbidden) {
    return forbidden;
  }

  const deleted = deleteDevUserToken(decodedUsername, key);

  if (!deleted) {
    return NextResponse.json(
      { error: `Token ${key} not found` },
      { status: 404 }
    );
  }

  // Gafaelfawr responds 204 No Content on a successful revoke.
  return new Response(null, { status: 204 });
}
