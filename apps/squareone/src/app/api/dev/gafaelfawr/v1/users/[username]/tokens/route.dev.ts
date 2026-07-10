/**
 * Mock of the Gafaelfawr per-user tokens collection endpoint.
 * GET  /auth/api/v1/users/:username/tokens  (list)
 * POST /auth/api/v1/users/:username/tokens  (create)
 * (rewritten to /api/dev/gafaelfawr/v1/users/:username/tokens)
 *
 * GET returns the user's tokens from the persistent dev store as an array of
 * `TokenInfo`, so `useUserTokens()` — and thus `/settings/tokens` and
 * `/settings/tokens/new` — render against real-shaped data instead of 404ing.
 * POST appends a new user token and returns a one-time full token string
 * (`CreateTokenResponse`), so the create flow on `/settings/tokens/new` works
 * end-to-end (success modal included) without a live Gafaelfawr.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { CreateTokenRequestSchema } from '@lsst-sqre/gafaelfawr-client';
import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';
import { addDevUserToken, getDevUserTokens } from '@/lib/mocks/userTokensStore';
import { forbiddenIfNotSelf, validationErrorResponse } from './authz.dev';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { loggedIn } = getDevState();
  if (!loggedIn) {
    return new Response('Not logged in', { status: 401 });
  }

  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const forbidden = forbiddenIfNotSelf(decodedUsername);
  if (forbidden) {
    return forbidden;
  }

  return NextResponse.json(getDevUserTokens(decodedUsername));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { loggedIn } = getDevState();
  if (!loggedIn) {
    return new Response('Not logged in', { status: 401 });
  }

  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const forbidden = forbiddenIfNotSelf(decodedUsername);
  if (forbidden) {
    return forbidden;
  }

  // Real Gafaelfawr returns a 422 for a malformed or schema-invalid body, so
  // parse defensively rather than letting request.json() throw a 500 or
  // storing an unvalidated (e.g. name-less) token.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return validationErrorResponse(
      ['body'],
      'Invalid JSON body',
      'value_error'
    );
  }

  const result = CreateTokenRequestSchema.safeParse(payload);
  if (!result.success) {
    const issue = result.error.issues[0];
    return validationErrorResponse(
      ['body', ...(issue?.path ?? [])],
      issue?.message ?? 'Invalid token creation request',
      issue?.code ?? 'value_error'
    );
  }

  const created = addDevUserToken(decodedUsername, {
    token_name: result.data.token_name,
    scopes: result.data.scopes,
    expires: result.data.expires ?? null,
  });

  // Gafaelfawr returns the one-time full token string, not the stored record.
  // The stored 22-character key stands in for the key half of `gt-<key>.<secret>`.
  return NextResponse.json(
    { token: `gt-${created.token}.mock-secret-value` },
    { status: 201 }
  );
}
