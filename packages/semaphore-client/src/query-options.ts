import {
  type ReportContext,
  type ReportError,
  reportingQueryFn,
} from '@lsst-sqre/api-client-core';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  fetchAdminNotification,
  fetchAdminNotifications,
  fetchBroadcasts,
  fetchUserNotification,
  fetchUserNotifications,
  getEmptyBroadcasts,
  type Logger,
} from './client';
import type { BroadcastsResponse } from './schemas';
import type {
  AdminNotificationFilters,
  AdminNotificationsPage,
  UserNotificationFilters,
  UserNotificationsPage,
} from './types';

export type BroadcastsQueryConfig = {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  logger?: Logger;
  /**
   * Hook invoked for report-worthy failures (contract drift, 5xx, server-side
   * network errors). Injected by the app so this package stays Sentry-agnostic;
   * see `@lsst-sqre/api-client-core`'s `reportingQueryFn`.
   */
  reportError?: ReportError;
  /** Context (e.g. `{ site, package }`) forwarded to `reportError`. */
  context?: ReportContext;
  /**
   * Runtime override forwarded to the error classifier: controls whether
   * network-level failures are report-worthy. Defaults to auto-detection.
   */
  isServer?: boolean;
};

const defaultConfig: Required<
  Omit<BroadcastsQueryConfig, 'logger' | 'reportError' | 'context' | 'isServer'>
> = {
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
    reportError,
    context,
    isServer,
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
    // Delegate to the shared reporting wrapper: it fetches, returns the empty
    // fallback on any failure (graceful degradation preserved), logs every
    // failure, and invokes the injected `reportError` for report-worthy ones
    // (ZodError contract drift, 5xx, server-side network errors).
    queryFn: reportingQueryFn<BroadcastsResponse>({
      fetchFn: () => fetchBroadcasts(semaphoreUrl, { logger }),
      fallback: getEmptyBroadcasts(),
      logger,
      reportError,
      context,
      isServer,
    }),
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

// =============================================================================
// User-facing notifications
// =============================================================================

/**
 * Serialize user notification filters into a stable, plain object for use in a
 * query key, so that distinct filter combinations cache separately.
 */
function userFiltersToKeyObject(
  filters: UserNotificationFilters
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (filters.unread) result.unread = true;
  if (filters.limit) result.limit = filters.limit;
  return result;
}

/**
 * Infinite query options for the authenticated user's notifications list.
 *
 * Uses cursor-based pagination conveyed via the `Link` header; the cursor is
 * threaded through `pageParam` and `getNextPageParam` reads it from the last
 * page's `nextCursor`.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param filters - `unread` / `limit` filters
 */
export const userNotificationsInfiniteQueryOptions = (
  semaphoreUrl: string,
  filters: UserNotificationFilters = {}
) =>
  infiniteQueryOptions({
    queryKey: [
      'user-notifications',
      semaphoreUrl,
      userFiltersToKeyObject(filters),
    ] as const,
    queryFn: ({ pageParam }): Promise<UserNotificationsPage> =>
      fetchUserNotifications(semaphoreUrl, { ...filters, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: UserNotificationsPage) => lastPage.nextCursor,
    enabled: !!semaphoreUrl,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

/**
 * Query options for a single user-facing notification by id.
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param id - Opaque notification id
 */
export const userNotificationQueryOptions = (
  semaphoreUrl: string,
  id: string
) =>
  queryOptions({
    queryKey: ['user-notification', semaphoreUrl, id] as const,
    queryFn: () => fetchUserNotification(semaphoreUrl, id),
    enabled: !!semaphoreUrl && !!id,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

/**
 * Tuning knobs for the unread-notification-count query.
 *
 * `refetchInterval` drives the background poll cadence for the header badge;
 * the squareone app derives it from the `userNotificationsPollIntervalSeconds`
 * config (converted to milliseconds).
 */
export type UnreadNotificationCountQueryConfig = {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
};

/**
 * Query options for the authenticated user's unread-notification count.
 *
 * Requests a single-item page filtered to unread notifications
 * (`?unread=true&limit=1`) purely to read the `X-Total-Count` header, which
 * carries the full unread total independent of the page slice. Resolves to that
 * count (0 when the header is absent).
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param config - Optional `staleTime` / `gcTime` / `refetchInterval` overrides
 */
export const unreadNotificationCountQueryOptions = (
  semaphoreUrl: string,
  config: UnreadNotificationCountQueryConfig = {}
) =>
  queryOptions({
    queryKey: ['unread-notification-count', semaphoreUrl] as const,
    queryFn: async (): Promise<number> => {
      const page = await fetchUserNotifications(semaphoreUrl, {
        unread: true,
        limit: 1,
      });
      return page.totalCount ?? 0;
    },
    enabled: !!semaphoreUrl,
    staleTime: config.staleTime ?? 60_000, // 60 seconds
    gcTime: config.gcTime ?? 5 * 60_000, // 5 minutes
    refetchInterval: config.refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
