/**
 * Mock of the Gafaelfawr OIDC client collection endpoint.
 * GET  /auth/api/v1/oidc-clients  (list)
 * POST /auth/api/v1/oidc-clients  (create)
 * (rewritten to /api/dev/gafaelfawr/v1/oidc-clients)
 *
 * GET returns the in-memory dev store as an array of `OIDCClient`, so
 * `useOidcClients()` — and the `/admin/oidc-clients` pages — render against
 * real-shaped data. POST registers a client and returns it with a generated
 * `client_secret` (`OIDCClientWithSecret`, 201), the one and only time
 * Gafaelfawr discloses a secret, so the "copy this now" create flow works
 * end-to-end without a live Gafaelfawr.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { OIDCClientUpdateSchema } from '@lsst-sqre/gafaelfawr-client';
import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';
import {
  addDevOidcClient,
  getDevOidcClients,
} from '@/lib/mocks/oidcClientsStore';

import { denyUnlessOidcAdmin, errorResponse } from './authz.dev';

export async function GET() {
  const denied = denyUnlessOidcAdmin();
  if (denied) {
    return denied;
  }

  return NextResponse.json(getDevOidcClients());
}

export async function POST(request: Request) {
  const denied = denyUnlessOidcAdmin();
  if (denied) {
    return denied;
  }

  // Real Gafaelfawr answers 422 for a malformed or schema-invalid body, so
  // parse defensively rather than letting request.json() throw a 500 or
  // storing an unvalidated client.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(422, 'Invalid JSON body', 'value_error', ['body']);
  }

  const result = OIDCClientUpdateSchema.safeParse(payload);
  if (!result.success) {
    const issue = result.error.issues[0];
    return errorResponse(
      422,
      issue?.message ?? 'Invalid OIDC client payload',
      issue?.code ?? 'value_error',
      ['body', ...(issue?.path ?? [])]
    );
  }

  // The real API attributes the change to the authenticated admin; in dev we
  // stand in the active dev-session username.
  const { username } = getDevState();
  const created = addDevOidcClient(result.data, username);

  return NextResponse.json(created, { status: 201 });
}
