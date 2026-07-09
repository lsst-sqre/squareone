/**
 * Mock of the Semaphore user-facing mark-unread endpoint.
 * POST /semaphore/v1/notifications/unread
 * (rewritten to /api/dev/semaphore/v1/notifications/unread)
 *
 * The mirror of the mark-read route. Accepts a `{ ids: string[] }` body and
 * marks those notifications unread in the persistent user-notifications store
 * via `markDevUserNotificationsUnread`, mirroring the real endpoint's
 * idempotent, silently-ignoring semantics: already-unread and unknown ids are
 * no-ops, and a successful call responds `204 No Content`. The semaphore-client
 * `markNotificationsUnread` POSTs exactly this shape.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { NextResponse } from 'next/server';

import { markDevUserNotificationsUnread } from '@/lib/mocks/userNotificationsStore';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate the `{ ids: string[] }` shape the user mark-unread endpoint expects.
  const ids = (payload as { ids?: unknown } | null)?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    return NextResponse.json(
      { error: 'Invalid payload; expected { ids: string[] }' },
      { status: 400 }
    );
  }

  markDevUserNotificationsUnread(ids);

  return new NextResponse(null, { status: 204 });
}
