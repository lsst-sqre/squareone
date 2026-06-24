/**
 * Shared types for the Semaphore admin notifications client.
 */
import type {
  UserNotificationSummary,
  UserNotificationWithUrl,
} from './schemas';

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

/**
 * Filter options for the user-facing notifications list query.
 *
 * Mirrors the query parameters accepted by `GET /v1/notifications`, minus the
 * cursor, which is handled separately by the pagination layer.
 */
export type UserNotificationFilters = {
  /** When true, return only unread notifications. */
  unread?: boolean;
  /** Maximum number of notifications to return per page. */
  limit?: number;
};

/**
 * Parameters for a single page request against `GET /v1/notifications`.
 *
 * Extends {@link UserNotificationFilters} with the opaque pagination cursor
 * returned as a previous page's `nextCursor`.
 */
export type UserNotificationListParams = UserNotificationFilters & {
  /** Opaque pagination cursor returned as a previous page's `nextCursor`. */
  cursor?: string | null;
};

/**
 * A single page of user-facing notification summaries.
 *
 * `nextCursor` is parsed from the RFC 5988 `Link` header (null when there
 * are no more pages); `totalCount` is read from the `X-Total-Count` header
 * (null when the header is absent, e.g. when no `limit` was requested).
 */
export type UserNotificationsPage = {
  entries: UserNotificationSummary[];
  nextCursor: string | null;
  totalCount: number | null;
};
