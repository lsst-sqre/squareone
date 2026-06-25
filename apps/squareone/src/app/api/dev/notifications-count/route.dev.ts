/**
 * Dev control endpoint for the mocked unread-notification count.
 * GET/POST /api/dev/notifications-count
 *
 * GET returns the current dev-selected unread count so the `/dev` notifications
 * panel can populate its control on mount. POST sets it (clamped to a
 * non-negative integer), which feeds the `/semaphore/v1/notifications` mock and
 * therefore the header unread badge. There is no production analogue: this is
 * dev-only tooling and the file is only built into the development server.
 */

import { NextResponse } from 'next/server';

import {
  getDevUnreadCount,
  setDevUnreadCount,
} from '@/lib/mocks/userNotificationsStore';

export async function GET() {
  return NextResponse.json({ count: getDevUnreadCount() });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const count = (payload as { count?: unknown })?.count;
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
    return NextResponse.json(
      { error: 'count must be a non-negative number' },
      { status: 400 }
    );
  }

  setDevUnreadCount(count);
  return NextResponse.json({ count: getDevUnreadCount() });
}
