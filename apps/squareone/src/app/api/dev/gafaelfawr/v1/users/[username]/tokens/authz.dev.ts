/**
 * Shared authorization / validation helpers for the Gafaelfawr per-user token
 * dev mocks.
 *
 * Real Gafaelfawr restricts a user to their own tokens and returns a 422 with a
 * Pydantic-shaped `{ detail: [...] }` body for a malformed or schema-invalid
 * request. These helpers let the collection and detail mock routes mirror that
 * behavior so error and cross-user paths are exercisable in dev.
 *
 * These files are only built into the development server (see `next.config.js`
 * `pageExtensions`), so they never reach the production bundle.
 */

import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';

/**
 * Return a 403 response when the requested username is not the active dev
 * session's own username, or `null` when access is allowed.
 *
 * Mirrors real Gafaelfawr, which only lets a user read/modify their own tokens.
 * The `/settings/tokens*` pages always request the logged-in user's own
 * username (from `useGafaelfawrUser`), so this stays compatible with the
 * persona-switching behavior in the `/dev` panel — switching persona changes
 * both the session username and the username the pages request.
 */
export function forbiddenIfNotSelf(
  requestedUsername: string
): NextResponse | null {
  const { username } = getDevState();
  if (requestedUsername !== username) {
    return NextResponse.json(
      {
        detail: [
          {
            loc: ['path', 'username'],
            msg: 'Permission denied',
            type: 'permission_denied',
          },
        ],
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Build a 422 response with a Gafaelfawr/Pydantic-shaped validation error body
 * (`{ detail: [{ loc, msg, type }] }`, per `ErrorResponseSchema`).
 */
export function validationErrorResponse(
  loc: (string | number)[],
  msg: string,
  type: string
): NextResponse {
  return NextResponse.json({ detail: [{ loc, msg, type }] }, { status: 422 });
}
