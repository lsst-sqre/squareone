/**
 * Mock of the Semaphore user-facing mark-read endpoint.
 * POST /semaphore/v1/notifications/read
 * (rewritten to /api/dev/semaphore/v1/notifications/read)
 *
 * Accepts a `{ ids: string[] }` body and marks those notifications read in the
 * persistent user-notifications store via `markDevUserNotificationsRead`,
 * mirroring the real endpoint's idempotent, silently-ignoring semantics:
 * already-read and unknown ids are no-ops, and a successful call responds
 * `204 No Content`. The semaphore-client `markNotificationsRead` POSTs exactly
 * this shape.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { NextResponse } from 'next/server';

import { markDevUserNotificationsRead } from '@/lib/mocks/userNotificationsStore';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate the `{ ids: string[] }` shape the user mark-read endpoint expects.
  const ids = (payload as { ids?: unknown } | null)?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    return NextResponse.json(
      { error: 'Invalid payload; expected { ids: string[] }' },
      { status: 400 }
    );
  }

  markDevUserNotificationsRead(ids);

  return new NextResponse(null, { status: 204 });
}
