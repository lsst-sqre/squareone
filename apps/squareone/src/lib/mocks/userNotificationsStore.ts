// In-memory dev store for the authenticated user's own notifications.
//
// Backs the user-facing notification dev mocks:
//   - GET /api/dev/semaphore/v1/notifications        (the inbox list)
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
  mockUserNotifications,
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

/** Reset the store to its seeded state. Primarily for tests. */
export function resetDevUserNotifications(): void {
  notifications = structuredClone(mockUserNotifications);
}
