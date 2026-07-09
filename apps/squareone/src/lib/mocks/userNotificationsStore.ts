// In-memory dev store for the authenticated user's own notifications.
//
// Backs the user-facing notification dev mocks:
//   - GET /api/dev/semaphore/v1/notifications/messages   (the inbox list)
// and therefore the header unread badge, which the semaphore-client
// `useUnreadNotificationCount` hook derives from that list endpoint's
// `X-Total-Count` for an `?unread=true` query.
//
// Unlike the admin store, this holds the current dev user's own notifications
// in the user-facing summary shape ({@link UserNotificationSummary}: a
// `FormattedText` summary, no sender/recipient). Read state is **persistent**
// within a dev session — seeded from the shared `mockUserNotifications`
// fixtures and mutated in place — so marking a notification read in the inbox
// (or by viewing its body) decrements the header badge without a live
// Semaphore. It is colocated with the rest of the dev tooling so it never
// reaches the production build.

import {
  type FormattedText,
  mockUserNotifications,
  type UserNotificationFormatted,
  type UserNotificationSummary,
} from '@lsst-sqre/semaphore-client';

// Most-recent-first, matching the order the Semaphore user list endpoint
// returns. Deep-cloned so marking read never mutates the shared fixtures.
let notifications: UserNotificationSummary[] = structuredClone(
  mockUserNotifications
);

/** Return the current user's notifications, most-recent first. */
export function getDevUserNotifications(): UserNotificationSummary[] {
  return notifications;
}

/**
 * Synthesize a detail body for a summary. The shared user fixtures are
 * summary-only, but the user detail endpoint returns a formatted `body`, so the
 * dev mock derives one from the summary text plus a clearly-marked development
 * note. The real service stores a distinct, richer body.
 */
function synthesizeBody(summary: FormattedText, id: string): FormattedText {
  return {
    gfm: `${summary.gfm}\n\n_(Development mock body for notification ${id}.)_`,
    html: `${summary.html}\n<p><em>(Development mock body for notification ${id}.)</em></p>`,
  };
}

/**
 * Return a single notification by id in the user-facing detail shape
 * ({@link UserNotificationFormatted}: `summary` + synthesized `body` as
 * `FormattedText`, no sender/recipient), or `undefined` when the id is unknown
 * (which the route turns into a 404). Fetching does **not** mark the
 * notification read; the read state reflects the persistent store.
 *
 * @param id - The notification id to look up
 * @returns The formatted notification, or undefined if not found
 */
export function getDevUserNotificationById(
  id: string
): UserNotificationFormatted | undefined {
  const notification = notifications.find((n) => n.id === id);
  if (!notification) {
    return undefined;
  }
  return {
    id: notification.id,
    created: notification.created,
    read: notification.read,
    summary: notification.summary,
    body: synthesizeBody(notification.summary, notification.id),
  };
}

/**
 * Mark the given notifications read, in place.
 *
 * Mirrors the idempotent semantics of `POST /v1/notifications/read`: matching
 * notifications that are currently unread get a fresh read timestamp;
 * already-read notifications keep their original one, and unknown ids are
 * silently ignored. Because the store is persistent, this lowers the unread
 * total the header badge reads from the list endpoint.
 *
 * Implemented inline rather than via the shared `markUserNotificationsRead`
 * helper because that helper's `{ id: string }` generic constraint is
 * unsatisfiable against this package's cross-package `z.infer` types (their keys
 * resolve as optional from squareone's side).
 *
 * @param ids - The notification ids to mark read
 */
export function markDevUserNotificationsRead(ids: string[]): void {
  const idSet = new Set(ids);
  const readDate = new Date().toISOString();
  notifications = notifications.map((notification) =>
    idSet.has(notification.id) && notification.read === null
      ? { ...notification, read: readDate }
      : notification
  );
}

/** Reset the store to its seeded state. Primarily for tests. */
export function resetDevUserNotifications(): void {
  notifications = structuredClone(mockUserNotifications);
}
