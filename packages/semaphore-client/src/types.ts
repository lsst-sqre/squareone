/**
 * Shared types for the Semaphore admin notifications client.
 */
import type { UserNotificationWithUrl } from './schemas';

/**
 * Filter options for the admin notifications list query.
 *
 * Mirrors the query parameters accepted by
 * `GET /v1/admin/notifications`. The cursor is handled separately by the
 * pagination layer and is therefore not part of the filters.
 */
export type AdminNotificationFilters = {
  /** Limit notifications to this recipient. */
  recipient?: string;
  /** Limit notifications to this sender. */
  sender?: string;
  /** Only show notifications created at or after this time. */
  since?: Date;
  /** Only show notifications created before or at this time. */
  until?: Date;
  /** Maximum number of notifications to return per page. */
  limit?: number;
};

/**
 * A single page of admin notifications.
 *
 * `nextCursor` is parsed from the RFC 5988 `Link` header (null when there
 * are no more pages); `totalCount` is read from the `X-Total-Count` header
 * (null when the header is absent).
 */
export type AdminNotificationsPage = {
  entries: UserNotificationWithUrl[];
  nextCursor: string | null;
  totalCount: number | null;
};
