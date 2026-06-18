/**
 * Mock of the Semaphore admin notification detail endpoint.
 * GET /semaphore/v1/admin/notifications/:id
 * (rewritten to /api/dev/semaphore/v1/admin/notifications/:id)
 *
 * Returns a single notification from the in-memory dev store in the detail
 * shape (`UserNotification`, without the list endpoint's `url`), or 404 when the
 * id is unknown so the detail page's not-found handling is exercisable.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { NextResponse } from 'next/server';

import { getDevNotificationById } from '@/lib/mocks/notificationsStore';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notification = getDevNotificationById(id);

  if (!notification) {
    return NextResponse.json(
      { error: `Notification ${id} not found` },
      { status: 404 }
    );
  }

  // The detail endpoint returns the notification without the list endpoint's
  // `url` field.
  const { url: _url, ...detail } = notification;
  return NextResponse.json(detail);
}
