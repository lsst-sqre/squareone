/**
 * Mock of the Semaphore user-facing notification detail endpoint.
 * GET /semaphore/v1/notifications/messages/:id
 * (rewritten to /api/dev/semaphore/v1/notifications/messages/:id)
 *
 * Returns a single notification from the persistent user-notifications dev
 * store, in the user-facing detail shape (`UserNotificationFormatted`: `summary`
 * and `body` as `FormattedText`, no sender/recipient), or 404 when the id is
 * unknown — so the detail page's not-found handling is exercisable. Fetching
 * does **not** auto-mark the notification read (that is a later slice).
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { NextResponse } from 'next/server';

import { getDevUserNotificationById } from '@/lib/mocks/userNotificationsStore';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const notification = getDevUserNotificationById(id);

  if (!notification) {
    return NextResponse.json(
      { error: `Notification ${id} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(notification);
}
