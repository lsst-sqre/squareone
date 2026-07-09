/**
 * Mock of the Semaphore user-facing notifications list endpoint.
 * GET /semaphore/v1/notifications/messages
 * (rewritten to /api/dev/semaphore/v1/notifications/messages)
 *
 * Filters and cursor-paginates the in-memory dev store via the shared
 * `filterAndPaginateUserNotifications` helper, conveying the next cursor through
 * an RFC 5988 `Link` header and the unread/total through `X-Total-Count` — the
 * same contract the real Semaphore user API uses (and that the semaphore-client
 * `fetchUserNotifications` parses). The header `useUnreadNotificationCount` hook
 * reads the total from a `?unread=true&limit=1` request, so the persistent dev
 * store's unread notifications drive the header badge — marking one read (from
 * the inbox or by viewing its body) lowers the count.
 *
 * This file is only built into the development server (see `next.config.js`
 * `pageExtensions`), so it never reaches the production bundle.
 */

import { filterAndPaginateUserNotifications } from '@lsst-sqre/semaphore-client';
import { NextResponse } from 'next/server';

import { getDevUserNotifications } from '@/lib/mocks/userNotificationsStore';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const limitParam = params.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : Number.NaN;
  const limit = Number.isNaN(parsedLimit) ? undefined : parsedLimit;

  const page = filterAndPaginateUserNotifications(getDevUserNotifications(), {
    unread: params.get('unread') === 'true',
    cursor: params.get('cursor'),
    limit,
  });

  const headers = new Headers();
  // The real endpoint only surfaces X-Total-Count / Link when a limit is set;
  // the badge always passes limit=1, which is how it reads the unread total.
  if (limit !== undefined && page.totalCount !== null) {
    headers.set('X-Total-Count', String(page.totalCount));
  }
  if (page.nextCursor) {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set('cursor', page.nextCursor);
    headers.set('Link', `<${nextUrl.toString()}>; rel="next"`);
  }

  return NextResponse.json(page.entries, { headers });
}
