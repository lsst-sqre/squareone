// In-memory dev store for the authenticated user's own notifications.
//
// Backs the dev `GET /api/dev/semaphore/v1/notifications` mock (the user-facing
// list endpoint that drives the header unread badge via the semaphore-client
// `useUnreadNotificationCount` hook). The unread count is adjustable at runtime
// from the `/dev` control panel through `GET`/`POST /api/dev/notifications-count`
// so the badge can be exercised end-to-end without a live Semaphore.
//
// It is colocated with the rest of the dev tooling so it never reaches the
// production build.

import {
  mockUserNotifications,
  type UserNotificationSummary,
} from '@lsst-sqre/semaphore-client';

// Base for the synthetic resource URL of generated notifications, matching the
// shape the Semaphore user list endpoint returns.
const MOCK_USER_URL_BASE =
  'https://data.example.com/semaphore/v1/notifications';

// Split the shared fixtures into unread "templates" (reused as realistic
// content for the generated unread entries) and the static read fixtures (kept
// so the unfiltered list always has a sensible read/unread mix).
const UNREAD_TEMPLATES = mockUserNotifications.filter((n) => n.read === null);
const READ_FIXTURES = mockUserNotifications.filter((n) => n.read !== null);

// Default to the number of unread fixtures so the header badge is populated as
// soon as the feature flag is enabled; adjustable from the `/dev` panel.
const DEFAULT_UNREAD_COUNT = UNREAD_TEMPLATES.length;

let unreadCount = DEFAULT_UNREAD_COUNT;

/** The dev-selected number of unread notifications. */
export function getDevUnreadCount(): number {
  return unreadCount;
}

/**
 * Set the dev-selected unread count, clamped to a non-negative integer.
 *
 * @param count - Desired number of unread notifications
 */
export function setDevUnreadCount(count: number): void {
  unreadCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

/**
 * Synthesize one unread summary, cycling through the realistic unread fixtures
 * for content but with a deterministic, collision-free id and resource URL.
 */
function buildUnread(index: number): UserNotificationSummary {
  const template = UNREAD_TEMPLATES[index % UNREAD_TEMPLATES.length];
  const id = `dev-unread-${index + 1}`;
  return {
    ...template,
    id,
    read: null,
    url: `${MOCK_USER_URL_BASE}/${id}`,
  };
}

/**
 * The current user notifications, most-recent first: `unreadCount` unread
 * summaries followed by the static read fixtures.
 *
 * `filterAndPaginateUserNotifications` derives both the page slice and the
 * `X-Total-Count` from this list, so the unread total the badge reads always
 * matches the dev-selected count.
 */
export function getDevUserNotifications(): UserNotificationSummary[] {
  const unread = Array.from({ length: unreadCount }, (_, i) => buildUnread(i));
  return [...unread, ...READ_FIXTURES];
}

/** Reset the unread count to its seeded default. Primarily for tests. */
export function resetDevUserNotifications(): void {
  unreadCount = DEFAULT_UNREAD_COUNT;
}
