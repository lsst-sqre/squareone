/**
 * Mock of the Semaphore admin notifications list/create endpoint.
 * GET/POST /semaphore/v1/admin/notifications
 * (rewritten to /api/dev/semaphore/v1/admin/notifications)
 *
 * GET filters and cursor-paginates the in-memory dev store via the shared
 * `filterAndPaginateNotifications` helper, conveying the next cursor through an
 * RFC 5988 `Link` header and the total through `X-Total-Count` — the same
 * contract the real Semaphore admin API uses (and that the semaphore-client
 * `fetchAdminNotifications` parses). POST appends to the in-memory store and
 * echoes back the created notification.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import {
  CreateUserNotificationSchema,
  filterAndPaginateNotifications,
} from '@lsst-sqre/semaphore-client';
import { NextResponse } from 'next/server';

import { getDevState } from '@/lib/mocks/devstate';
import {
  addDevNotification,
  getDevNotifications,
} from '@/lib/mocks/notificationsStore';

// Default page size so "Load more" is demonstrable against the 8 seeded
// fixtures.
const DEFAULT_LIMIT = 5;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const limitParam = params.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : Number.NaN;
  const limit = Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit;

  const page = filterAndPaginateNotifications(getDevNotifications(), {
    recipient: params.get('recipient') ?? undefined,
    sender: params.get('sender') ?? undefined,
    since: params.get('since') ?? undefined,
    until: params.get('until') ?? undefined,
    cursor: params.get('cursor'),
    limit,
  });

  const headers = new Headers();
  if (page.totalCount !== null) {
    headers.set('X-Total-Count', String(page.totalCount));
  }
  if (page.nextCursor) {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set('cursor', page.nextCursor);
    headers.set('Link', `<${nextUrl.toString()}>; rel="next"`);
  }

  return NextResponse.json(page.entries, { headers });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = CreateUserNotificationSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid notification payload', detail: result.error.format() },
      { status: 400 }
    );
  }

  // The real API attributes the sender to the authenticated admin; in dev we
  // stand in the active dev-session username.
  const { username } = getDevState();
  const created = addDevNotification(result.data, username);

  return NextResponse.json(created, { status: 201 });
}
