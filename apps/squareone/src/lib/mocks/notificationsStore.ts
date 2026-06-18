// In-memory dev store for admin notifications.
//
// Seeds from the shared `mockAdminNotifications` fixtures (the same dataset the
// Storybook stories use) and lets the dev `POST /api/dev/semaphore/v1/admin/
// notifications` route append new notifications at runtime so the compose form
// is exercisable end-to-end without a live Semaphore. It is colocated with the
// rest of the dev tooling so it never reaches the production build.

import {
  type CreateUserNotification,
  mockAdminNotifications,
  type UserNotificationWithUrl,
} from '@lsst-sqre/semaphore-client';

// Base for the synthetic resource URL of created notifications, matching the
// shape Semaphore returns from the list endpoint.
const MOCK_URL_BASE =
  'https://data.example.com/semaphore/v1/admin/notifications';

// Most-recent-first, matching the order the Semaphore admin list endpoint
// returns. Deep-cloned so appends never mutate the shared fixtures.
let notifications: UserNotificationWithUrl[] = structuredClone(
  mockAdminNotifications
);

// Monotonic counter for deterministic, collision-free ids within a dev session.
let counter = 0;

/** Return the current notifications, most-recent first. */
export function getDevNotifications(): UserNotificationWithUrl[] {
  return notifications;
}

/** Return the notification with the given id, or undefined if not found. */
export function getDevNotificationById(
  id: string
): UserNotificationWithUrl | undefined {
  return notifications.find((notification) => notification.id === id);
}

/**
 * Append a new notification to the store and return the created record.
 *
 * Mirrors the server's create behavior: the server assigns the id, creation
 * time, sender, and read status (null), echoing back the full record with its
 * resource URL.
 *
 * @param input - The `{ recipient, summary, body? }` create payload
 * @param sender - The sender attributed to the notification (the dev session
 *   username, standing in for the authenticated admin)
 * @returns The created notification, including its resource URL
 */
export function addDevNotification(
  input: CreateUserNotification,
  sender: string
): UserNotificationWithUrl {
  counter += 1;
  const id = `dev-ntf-${counter}`;
  const record: UserNotificationWithUrl = {
    id,
    created: new Date().toISOString(),
    read: null,
    sender,
    recipient: input.recipient,
    summary: input.summary,
    body: input.body ?? null,
    url: `${MOCK_URL_BASE}/${id}`,
  };
  notifications = [record, ...notifications];
  return record;
}

/** Reset the store to its seeded state. Primarily for tests. */
export function resetDevNotifications(): void {
  notifications = structuredClone(mockAdminNotifications);
  counter = 0;
}
