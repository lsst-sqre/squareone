import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  fetchAdminNotification,
  fetchAdminNotifications,
  fetchBroadcasts,
  getEmptyBroadcasts,
  type Logger,
} from './client';
import type { BroadcastsResponse } from './schemas';
import type { AdminNotificationFilters, AdminNotificationsPage } from './types';

export type BroadcastsQueryConfig = {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  logger?: Logger;
};

const defaultConfig: Required<Omit<BroadcastsQueryConfig, 'logger'>> = {
  staleTime: 60 * 1000, // 60s
  gcTime: 10 * 60 * 1000, // 10 min
  refetchInterval: 60 * 1000, // 60s polling
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

export const broadcastsQueryOptions = (
  semaphoreUrl: string,
  config?: BroadcastsQueryConfig
) => {
  const {
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnReconnect,
    logger: log,
  } = {
    ...defaultConfig,
    ...config,
  };

  const defaultLog: Logger = {
    debug: (obj, msg) => console.log(msg, obj),
    warn: (obj, msg) => console.warn(msg, obj),
    error: (obj, msg) => console.error(msg, obj),
  };
  const logger = log ?? defaultLog;

  return queryOptions({
    queryKey: ['broadcasts', semaphoreUrl] as const,
    queryFn: async (): Promise<BroadcastsResponse> => {
      try {
        return await fetchBroadcasts(semaphoreUrl, { logger });
      } catch (error) {
        logger.error({ err: error }, 'Failed to fetch broadcasts');
        return getEmptyBroadcasts();
      }
    },
    enabled: !!semaphoreUrl,
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnReconnect,
  });
};

// =============================================================================
// Admin notifications
// =============================================================================

/**
 * Serialize admin notification filters into a stable, plain object for use in
 * a query key. `Date` filters are normalized to ISO strings so that distinct
 * filter combinations cache separately.
 */
function filtersToKeyObject(
  filters: AdminNotificationFilters
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (filters.recipient) result.recipient = filters.recipient;
  if (filters.sender) result.sender = filters.sender;
  if (filters.since) result.since = filters.since.toISOString();
  if (filters.until) result.until = filters.until.toISOString();
  if (filters.limit) result.limit = filters.limit;
  return result;
}

/**
 * Infinite query options for the admin notifications list.
 *
 * Uses cursor-based pagination conveyed via the `Link` header; the cursor is
 * threaded through `pageParam` and `getNextPageParam` reads it from the last
 * page's `nextCursor`.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param filters - Recipient/sender/date-range/limit filters
 */
export const adminNotificationsInfiniteQueryOptions = (
  semaphoreUrl: string,
  filters: AdminNotificationFilters = {}
) =>
  infiniteQueryOptions({
    queryKey: [
      'admin-notifications',
      semaphoreUrl,
      filtersToKeyObject(filters),
    ] as const,
    queryFn: ({ pageParam }): Promise<AdminNotificationsPage> =>
      fetchAdminNotifications(semaphoreUrl, filters, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: AdminNotificationsPage) => lastPage.nextCursor,
    enabled: !!semaphoreUrl,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

/**
 * Query options for a single admin notification by id.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param id - Opaque notification id
 */
export const adminNotificationQueryOptions = (
  semaphoreUrl: string,
  id: string
) =>
  queryOptions({
    queryKey: ['admin-notification', semaphoreUrl, id] as const,
    queryFn: () => fetchAdminNotification(semaphoreUrl, id),
    enabled: !!semaphoreUrl && !!id,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
