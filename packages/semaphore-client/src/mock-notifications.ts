/**
 * Fixture data and a pure filter+paginate helper for admin notifications.
 *
 * The fixtures and helper are shared by the squareone dev API routes (which
 * serve them and emit a `Link` header) and by Storybook stories (which pass
 * them through props). Keeping the filter/paginate logic here means dev and
 * Storybook stay in lock-step with one implementation.
 */
import type {
  UserNotification,
  UserNotificationFormatted,
  UserNotificationSummary,
  UserNotificationWithUrl,
} from './schemas';
import type { AdminNotificationsPage, UserNotificationsPage } from './types';

const MOCK_URL_BASE =
  'https://data.example.com/semaphore/v1/admin/notifications';

function withUrl(notification: UserNotification): UserNotificationWithUrl {
  return { ...notification, url: `${MOCK_URL_BASE}/${notification.id}` };
}

/**
 * A realistic set of admin notifications, ordered most-recent first (the same
 * order the Semaphore admin list endpoint returns). Covers a mix of
 * recipients, senders, read/unread status, and present/absent bodies so that
 * filtering and rendering can be exercised.
 */
export const mockAdminNotifications: UserNotificationWithUrl[] = [
  withUrl({
    id: 'ntf-001',
    created: '2026-06-12T17:10:32+00:00',
    read: null,
    sender: 'bot-quota-notifier',
    recipient: 'alice',
    summary: 'You are approaching your disk space **quota** limit',
    body: 'You are using 448GiB of disk out of a quota of 500GiB. Consider cleaning up old scratch files.',
  }),
  withUrl({
    id: 'ntf-002',
    created: '2026-06-11T09:00:00+00:00',
    read: '2026-06-11T10:00:00+00:00',
    sender: 'bot-quota-notifier',
    recipient: 'bob',
    summary: 'Your notebook server was culled after 24h idle',
    body: null,
  }),
  withUrl({
    id: 'ntf-003',
    created: '2026-06-10T12:30:00+00:00',
    read: null,
    sender: 'ops-runbook',
    recipient: 'alice',
    summary: 'Scheduled maintenance window this weekend',
    body: 'The RSP will be unavailable on **Saturday 06:00–10:00 UTC** for database upgrades.',
  }),
  withUrl({
    id: 'ntf-004',
    created: '2026-06-09T08:15:00+00:00',
    read: null,
    sender: 'bot-quota-notifier',
    recipient: 'carol',
    summary: 'Your TAP query results are ready',
    body: null,
  }),
  withUrl({
    id: 'ntf-005',
    created: '2026-06-08T22:45:00+00:00',
    read: '2026-06-09T00:00:00+00:00',
    sender: 'ops-runbook',
    recipient: 'alice',
    summary:
      'Please review the updated [data rights policy](https://example.com/policy)',
    body: 'All users must acknowledge the updated policy before **July 1**.',
  }),
  withUrl({
    id: 'ntf-006',
    created: '2026-06-07T14:00:00+00:00',
    read: null,
    sender: 'bot-quota-notifier',
    recipient: 'bob',
    summary: 'A new image release is available in the spawner',
    body: null,
  }),
  withUrl({
    id: 'ntf-007',
    created: '2026-06-06T06:00:00+00:00',
    read: null,
    sender: 'ops-runbook',
    recipient: 'dave',
    summary: 'Welcome to the Rubin Science Platform',
    body: 'Get started with the [documentation](https://rsp.lsst.io) and tutorial notebooks.',
  }),
  withUrl({
    id: 'ntf-008',
    created: '2026-06-05T18:20:00+00:00',
    read: null,
    sender: 'bot-quota-notifier',
    recipient: 'alice',
    summary: 'Your batch job has completed',
    body: null,
  }),
];

/**
 * A single admin notification fixture (detail-shaped, without a `url`),
 * convenient for detail-page and detail-view stories.
 */
export const mockAdminNotification: UserNotification = (() => {
  const { url: _url, ...detail } = mockAdminNotifications[0];
  return detail;
})();

/**
 * Parameters accepted by {@link filterAndPaginateNotifications}.
 *
 * `since`/`until` accept either a `Date` or an ISO 8601 string so that dev
 * API routes can pass raw query-string values straight through.
 */
export type FilterPaginateParams = {
  recipient?: string;
  sender?: string;
  since?: Date | string;
  until?: Date | string;
  /** Opaque pagination cursor returned as a previous page's `nextCursor`. */
  cursor?: string | null;
  /** Page size. When omitted, all matching notifications are returned. */
  limit?: number;
};

function toMillis(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/**
 * Filter and paginate a list of notifications, mirroring the behavior of the
 * Semaphore admin list endpoint.
 *
 * Filtering matches `recipient`/`sender` exactly and applies an inclusive
 * `since`/`until` window on the `created` timestamp. Pagination is expressed
 * with an **opaque numeric-offset cursor** (an implementation detail of this
 * mock; the real API uses Safir cursors). `totalCount` always reflects the
 * full filtered set, independent of the page slice.
 *
 * @param notifications - The full (most-recent-first) dataset
 * @param params - Filter and pagination parameters
 * @returns A page shaped like {@link AdminNotificationsPage}
 */
export function filterAndPaginateNotifications(
  notifications: UserNotificationWithUrl[],
  params: FilterPaginateParams
): AdminNotificationsPage {
  const { recipient, sender, since, until, cursor, limit } = params;

  const sinceMs = since !== undefined ? toMillis(since) : null;
  const untilMs = until !== undefined ? toMillis(until) : null;

  const filtered = notifications.filter((n) => {
    if (recipient && n.recipient !== recipient) return false;
    if (sender && n.sender !== sender) return false;
    const createdMs = new Date(n.created).getTime();
    if (sinceMs !== null && createdMs < sinceMs) return false;
    if (untilMs !== null && createdMs > untilMs) return false;
    return true;
  });

  const totalCount = filtered.length;

  if (!limit) {
    return { entries: filtered, nextCursor: null, totalCount };
  }

  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  const start = Number.isNaN(offset) ? 0 : offset;
  const end = start + limit;
  const entries = filtered.slice(start, end);
  const nextCursor = end < totalCount ? String(end) : null;

  return { entries, nextCursor, totalCount };
}

// =============================================================================
// User-facing notifications
// =============================================================================

const MOCK_USER_URL_BASE =
  'https://data.example.com/semaphore/v1/notifications/messages';

/**
 * A realistic set of user-facing notification summaries, ordered most-recent
 * first (the same order the Semaphore user list endpoint returns). Unlike the
 * admin fixtures, `summary` is {@link UserNotificationSummary}-shaped
 * `FormattedText` ({ gfm, html }) and there is no sender/recipient. Covers a
 * mix of read/unread status so filtering and rendering can be exercised.
 */
export const mockUserNotifications: UserNotificationSummary[] = [
  {
    id: 'ntf-001',
    created: '2026-06-12T17:10:32+00:00',
    read: null,
    summary: {
      gfm: 'You are approaching your disk space **quota** limit',
      html: '<p>You are approaching your disk space <strong>quota</strong> limit</p>',
    },
    url: `${MOCK_USER_URL_BASE}/ntf-001`,
  },
  {
    id: 'ntf-002',
    created: '2026-06-11T09:00:00+00:00',
    read: '2026-06-11T10:00:00+00:00',
    summary: {
      gfm: 'Your notebook server was culled after 24h idle',
      html: '<p>Your notebook server was culled after 24h idle</p>',
    },
    url: `${MOCK_USER_URL_BASE}/ntf-002`,
  },
  {
    id: 'ntf-003',
    created: '2026-06-10T12:30:00+00:00',
    read: null,
    summary: {
      gfm: 'Scheduled maintenance window this weekend',
      html: '<p>Scheduled maintenance window this weekend</p>',
    },
    url: `${MOCK_USER_URL_BASE}/ntf-003`,
  },
  {
    id: 'ntf-004',
    created: '2026-06-09T08:15:00+00:00',
    read: null,
    summary: {
      gfm: 'Your TAP query results are ready',
      html: '<p>Your TAP query results are ready</p>',
    },
    url: `${MOCK_USER_URL_BASE}/ntf-004`,
  },
  {
    id: 'ntf-005',
    created: '2026-06-08T22:45:00+00:00',
    read: '2026-06-09T00:00:00+00:00',
    summary: {
      gfm: 'Please review the updated [data rights policy](https://example.com/policy)',
      html: '<p>Please review the updated <a href="https://example.com/policy">data rights policy</a></p>',
    },
    url: `${MOCK_USER_URL_BASE}/ntf-005`,
  },
  {
    id: 'ntf-006',
    created: '2026-06-07T14:00:00+00:00',
    read: null,
    summary: {
      gfm: 'A new image release is available in the spawner',
      html: '<p>A new image release is available in the spawner</p>',
    },
    url: `${MOCK_USER_URL_BASE}/ntf-006`,
  },
];

/**
 * A single user-facing notification fixture in the formatted detail shape
 * ({@link UserNotificationFormatted}: `summary` + `body` as `FormattedText`,
 * no `url`), convenient for detail-page and detail-view stories.
 */
export const mockUserNotification: UserNotificationFormatted = {
  id: 'ntf-001',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  summary: {
    gfm: 'You are approaching your disk space **quota** limit',
    html: '<p>You are approaching your disk space <strong>quota</strong> limit</p>',
  },
  body: {
    gfm: 'You are using **448GiB** of disk out of a quota of 500GiB. Consider cleaning up old scratch files.',
    html: '<p>You are using <strong>448GiB</strong> of disk out of a quota of 500GiB. Consider cleaning up old scratch files.</p>',
  },
};

/**
 * Parameters accepted by {@link filterAndPaginateUserNotifications}.
 */
export type UserFilterPaginateParams = {
  /** When true, return only unread notifications (`read === null`). */
  unread?: boolean;
  /** Opaque pagination cursor returned as a previous page's `nextCursor`. */
  cursor?: string | null;
  /** Page size. When omitted, all matching notifications are returned. */
  limit?: number;
};

/**
 * Filter and paginate a list of user notification summaries, mirroring the
 * behavior of the Semaphore user list endpoint.
 *
 * Filtering applies the `unread` toggle (keep only notifications whose `read`
 * is null). Pagination uses the same **opaque numeric-offset cursor** as the
 * admin helper; `totalCount` always reflects the full filtered set,
 * independent of the page slice.
 *
 * @param notifications - The full (most-recent-first) dataset
 * @param params - Filter and pagination parameters
 * @returns A page shaped like {@link UserNotificationsPage}
 */
export function filterAndPaginateUserNotifications(
  notifications: UserNotificationSummary[],
  params: UserFilterPaginateParams
): UserNotificationsPage {
  const { unread, cursor, limit } = params;

  const filtered = unread
    ? notifications.filter((n) => n.read === null)
    : notifications;

  const totalCount = filtered.length;

  if (!limit) {
    return { entries: filtered, nextCursor: null, totalCount };
  }

  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  const start = Number.isNaN(offset) ? 0 : offset;
  const end = start + limit;
  const entries = filtered.slice(start, end);
  const nextCursor = end < totalCount ? String(end) : null;

  return { entries, nextCursor, totalCount };
}

/**
 * Return a copy of `notifications` with the given ids marked read.
 *
 * Mirrors the idempotent semantics of `POST /v1/notifications/read`: matching
 * notifications that are currently unread get their `read` set to `readDate`;
 * already-read notifications and ids not in the set are left untouched. The
 * input array is not mutated. Generic over the notification shape so dev routes
 * can apply it to either summary or detail records in their in-memory store.
 *
 * @param notifications - The notifications to update
 * @param ids - The notification ids to mark read
 * @param readDate - ISO 8601 timestamp to record as the read time
 * @returns A new array with the matching unread notifications marked read
 */
export function markUserNotificationsRead<
  T extends { id: string; read: string | null },
>(
  notifications: T[],
  ids: string[],
  readDate: string = new Date().toISOString()
): T[] {
  const idSet = new Set(ids);
  return notifications.map((n) =>
    idSet.has(n.id) && n.read === null ? { ...n, read: readDate } : n
  );
}
