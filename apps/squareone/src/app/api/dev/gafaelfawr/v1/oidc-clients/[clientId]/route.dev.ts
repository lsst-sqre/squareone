/**
 * Mock of the Gafaelfawr single OIDC client endpoint.
 * GET    /auth/api/v1/oidc-clients/:clientId  (detail)
 * PATCH  /auth/api/v1/oidc-clients/:clientId  (update)
 * DELETE /auth/api/v1/oidc-clients/:clientId  (delete)
 * (rewritten to /api/dev/gafaelfawr/v1/oidc-clients/:clientId)
 *
 * Backed by the same in-memory store as the collection route, so the edit and
 * delete flows on `/admin/oidc-clients` are exercisable end-to-end. A 404 here
 * means "no such client" — distinct from the collection route's 404, which the
 * client package raises as `OidcNotConfiguredError`.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { OIDCClientUpdateSchema } from '@lsst-sqre/gafaelfawr-client';
import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';
import {
  deleteDevOidcClient,
  getDevOidcClientById,
  updateDevOidcClient,
} from '@/lib/mocks/oidcClientsStore';

import {
  clientNotFoundResponse,
  denyUnlessOidcAdmin,
  errorResponse,
} from '../authz.dev';

/**
 * Next resolves a dynamic segment to its URL-*decoded* value in a route
 * handler exactly as it does in a page, so `clientId` arrives ready to use.
 * Decoding it again here would be a second pass over an already-decoded
 * string: harmless for the UUID-shaped ids Gafaelfawr issues, but it would
 * mangle any id holding a `%` — and `decodeURIComponent` throws `URIError` on
 * a lone one, turning a would-be 404 into a 500 the real API never returns.
 */
type RouteContext = { params: Promise<{ clientId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const denied = denyUnlessOidcAdmin();
  if (denied) {
    return denied;
  }

  const { clientId } = await params;
  const client = getDevOidcClientById(clientId);
  if (!client) {
    return clientNotFoundResponse(clientId);
  }

  return NextResponse.json(client);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = denyUnlessOidcAdmin();
  if (denied) {
    return denied;
  }

  const { clientId } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(422, 'Invalid JSON body', 'value_error', ['body']);
  }

  // Gafaelfawr spells this PATCH but requires the whole updatable state, so
  // the same schema validates create and update.
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

  const { username } = getDevState();
  const updated = updateDevOidcClient(clientId, result.data, username);
  if (!updated) {
    return clientNotFoundResponse(clientId);
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = denyUnlessOidcAdmin();
  if (denied) {
    return denied;
  }

  const { clientId } = await params;
  if (!deleteDevOidcClient(clientId)) {
    return clientNotFoundResponse(clientId);
  }

  // Gafaelfawr responds 204 No Content on a successful delete.
  return new Response(null, { status: 204 });
}
