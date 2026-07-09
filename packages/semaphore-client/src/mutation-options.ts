import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import {
  createAdminNotification,
  markNotificationsRead,
  markNotificationsUnread,
} from './client';
import type {
  CreateUserNotification,
  UserNotificationWithUrl,
} from './schemas';

/**
 * Variables for the create-admin-notification mutation.
 */
export type CreateAdminNotificationVariables = {
  /** The `{ recipient, summary, body? }` payload to create. */
  notification: CreateUserNotification;
  /** CSRF token sourced by the caller from Gafaelfawr login info. */
  csrfToken: string;
};

/**
 * TanStack Query mutation options for creating an admin notification.
 *
 * On success, invalidates the admin-notifications list query so the listing
 * reflects the newly created notification. The invalidation key is the
 * `['admin-notifications', semaphoreUrl]` prefix of the list query key defined
 * in `adminNotificationsInfiniteQueryOptions`, so every filter variant of the
 * list is invalidated.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param queryClient - Query client used to invalidate the list on success
 */
export const createAdminNotificationMutationOptions = (
  semaphoreUrl: string,
  queryClient: QueryClient
) =>
  mutationOptions({
    mutationFn: ({
      notification,
      csrfToken,
    }: CreateAdminNotificationVariables): Promise<UserNotificationWithUrl> =>
      createAdminNotification(semaphoreUrl, notification, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-notifications', semaphoreUrl],
      });
    },
  });

/**
 * Variables for the mark-notifications-read mutation.
 */
export type MarkNotificationsReadVariables = {
  /** The notification ids to mark read. */
  ids: string[];
  /** CSRF token sourced by the caller from Gafaelfawr login info. */
  csrfToken: string;
};

/**
 * TanStack Query mutation options for marking user notifications read.
 *
 * On success, invalidates every query the read affects: the user-notifications
 * list (the `['user-notifications', semaphoreUrl]` prefix, covering all filter
 * variants), the unread count, and the detail query for each marked id — so the
 * inbox, header badge, and any open detail view all reflect the new read state.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param queryClient - Query client used to invalidate affected queries on success
 */
export const markNotificationsReadMutationOptions = (
  semaphoreUrl: string,
  queryClient: QueryClient
) =>
  mutationOptions({
    mutationFn: ({
      ids,
      csrfToken,
    }: MarkNotificationsReadVariables): Promise<void> =>
      markNotificationsRead(semaphoreUrl, ids, csrfToken),
    onSuccess: (_data, { ids }: MarkNotificationsReadVariables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-notifications', semaphoreUrl],
      });
      queryClient.invalidateQueries({
        queryKey: ['unread-notification-count', semaphoreUrl],
      });
      for (const id of ids) {
        queryClient.invalidateQueries({
          queryKey: ['user-notification', semaphoreUrl, id],
        });
      }
    },
  });

/**
 * Variables for the mark-notifications-unread mutation.
 */
export type MarkNotificationsUnreadVariables = {
  /** The notification ids to mark unread. */
  ids: string[];
  /** CSRF token sourced by the caller from Gafaelfawr login info. */
  csrfToken: string;
};

/**
 * TanStack Query mutation options for marking user notifications unread.
 *
 * The mirror of {@link markNotificationsReadMutationOptions}: on success it
 * invalidates the same set of queries the change affects — the user-
 * notifications list (the `['user-notifications', semaphoreUrl]` prefix,
 * covering all filter variants), the unread count, and the detail query for
 * each affected id — so the inbox, header badge, and any open detail view all
 * reflect the new unread state.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param queryClient - Query client used to invalidate affected queries on success
 */
export const markNotificationsUnreadMutationOptions = (
  semaphoreUrl: string,
  queryClient: QueryClient
) =>
  mutationOptions({
    mutationFn: ({
      ids,
      csrfToken,
    }: MarkNotificationsUnreadVariables): Promise<void> =>
      markNotificationsUnread(semaphoreUrl, ids, csrfToken),
    onSuccess: (_data, { ids }: MarkNotificationsUnreadVariables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-notifications', semaphoreUrl],
      });
      queryClient.invalidateQueries({
        queryKey: ['unread-notification-count', semaphoreUrl],
      });
      for (const id of ids) {
        queryClient.invalidateQueries({
          queryKey: ['user-notification', semaphoreUrl, id],
        });
      }
    },
  });
