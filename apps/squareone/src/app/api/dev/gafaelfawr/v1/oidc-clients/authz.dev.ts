/**
 * Shared authorization / error helpers for the Gafaelfawr OIDC client dev
 * mocks.
 *
 * Real Gafaelfawr guards this API with the `admin:oidc` scope and answers with
 * an `ErrorModel` body (`{ detail: [{ loc, msg, type }] }`) for 403/404/422.
 * These helpers let the collection and detail mock routes mirror that, so the
 * admin UI's permission, not-found, and validation paths are all exercisable
 * from the `/dev` panel by toggling the scope off.
 *
 * These files are only built into the development server (see `next.config.js`
 * `pageExtensions`), so they never reach the production bundle.
 */

import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';

/** The scope Gafaelfawr requires for every OIDC client endpoint. */
export const OIDC_ADMIN_SCOPE = 'admin:oidc';

/**
 * Build an `ErrorModel`-shaped response, matching Gafaelfawr's error body.
 *
 * `loc` is omitted for errors about the request as a whole (a 403, a missing
 * client), which is exactly how Gafaelfawr reports them.
 */
export function errorResponse(
  status: number,
  msg: string,
  type: string,
  loc?: (string | number)[]
): NextResponse {
  return NextResponse.json(
    { detail: [{ loc: loc ?? null, msg, type }] },
    { status }
  );
}

/**
 * Return a 401/403 response when the dev session may not use the OIDC client
 * API, or `null` when it may.
 *
 * Toggling `admin:oidc` off in the `/dev` panel is the supported way to see the
 * admin UI's permission-denied path.
 */
export function denyUnlessOidcAdmin(): NextResponse | null {
  const { loggedIn, scopes } = getDevState();
  if (!loggedIn) {
    return errorResponse(401, 'Not authenticated', 'not_authenticated');
  }
  if (!scopes.includes(OIDC_ADMIN_SCOPE)) {
    return errorResponse(403, 'Permission denied', 'permission_denied');
  }
  return null;
}

/** The 404 Gafaelfawr returns for an unknown client id. */
export function clientNotFoundResponse(clientId: string): NextResponse {
  return errorResponse(
    404,
    `OpenID Connect client ${clientId} not found`,
    'not_found'
  );
}
