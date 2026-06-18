import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import { createAdminNotification } from './client';
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
