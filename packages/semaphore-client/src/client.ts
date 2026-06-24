import { z } from 'zod';
import {
  type BroadcastsResponse,
  BroadcastsResponseSchema,
  type CreateUserNotification,
  CreateUserNotificationSchema,
  type UserNotification,
  type UserNotificationFormatted,
  UserNotificationFormattedSchema,
  UserNotificationSchema,
  UserNotificationSummarySchema,
  type UserNotificationWithUrl,
  UserNotificationWithUrlSchema,
} from './schemas';
import type {
  AdminNotificationFilters,
  AdminNotificationsPage,
  UserNotificationListParams,
  UserNotificationsPage,
} from './types';

/**
 * Minimal logger interface compatible with pino's calling convention.
 */
export type Logger = {
  debug: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
};

const defaultLogger: Logger = {
  debug: (obj, msg) => console.log(msg, obj),
  warn: (obj, msg) => console.warn(msg, obj),
  error: (obj, msg) => console.error(msg, obj),
};

export class SemaphoreError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'SemaphoreError';
  }
}

/**
 * Normalize a Semaphore base URL by stripping trailing slashes.
 */
function normalizeUrl(url: string): string {
  let normalized = url;
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

// Module-level cache for deduplication (applies to both server and client contexts)
let cachedBroadcasts: BroadcastsResponse | null = null;
let cacheTimestamp = 0;
let cachedUrl: string | null = null;
// Cache TTL must align with TanStack Query's refetchInterval (60s) to allow
// client-side polling to trigger actual network requests
const CACHE_TTL = 60 * 1000;

/**
 * Clear the module-level cache. Primarily for testing.
 */
export function clearBroadcastsCache(): void {
  cachedBroadcasts = null;
  cacheTimestamp = 0;
  cachedUrl = null;
}

export type FetchOptions = {
  requestId?: string;
  forceRefresh?: boolean;
  logger?: Logger;
};

/**
 * Fetch broadcast messages from the Semaphore API.
 */
export async function fetchBroadcasts(
  semaphoreUrl: string,
  options?: FetchOptions
): Promise<BroadcastsResponse> {
  const {
    requestId,
    forceRefresh = false,
    logger: log = defaultLogger,
  } = options ?? {};

  const now = Date.now();

  // Check module-level cache
  if (
    !forceRefresh &&
    cachedBroadcasts &&
    cachedUrl === semaphoreUrl &&
    now - cacheTimestamp < CACHE_TTL
  ) {
    const cacheAge = Math.round((now - cacheTimestamp) / 1000);
    log.debug({ requestId, cacheAge }, 'Using cached broadcasts');
    return cachedBroadcasts;
  }

  // Remove trailing slashes, then append /v1/broadcasts
  const broadcastsUrl = `${normalizeUrl(semaphoreUrl)}/v1/broadcasts`;

  const startTime = Date.now();
  log.debug({ requestId, broadcastsUrl }, 'Starting network fetch');

  const response = await fetch(broadcastsUrl, { cache: 'no-store' });

  const fetchDuration = Date.now() - startTime;
  log.debug(
    { requestId, fetchDuration, status: response.status },
    'Network fetch completed'
  );

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  const parsed = BroadcastsResponseSchema.parse(data);

  // Update module-level cache
  cachedBroadcasts = parsed;
  cachedUrl = semaphoreUrl;
  cacheTimestamp = now;

  return parsed;
}

/**
 * Return an empty broadcasts response for fallback/error cases.
 */
export function getEmptyBroadcasts(): BroadcastsResponse {
  return [];
}

// =============================================================================
// Admin notifications
// =============================================================================

/**
 * Parse the next-page cursor from an RFC 5988 `Link` header.
 *
 * Mirrors the cursor-parsing approach in
 * `packages/gafaelfawr-client/src/client.ts`.
 *
 * @param linkHeader - Value of the `Link` response header
 * @returns The `cursor` query parameter of the `rel="next"` link, or null
 */
function parseCursorFromLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const nextMatch = linkHeader.match(
    /<[^>]*[?&]cursor=([^>&]+)[^>]*>;\s*rel="next"/
  );
  if (nextMatch) {
    return decodeURIComponent(nextMatch[1]);
  }

  return null;
}

/**
 * Fetch a page of admin notifications from the Semaphore admin API.
 *
 * Applies the `recipient` / `sender` / `since` / `until` / `limit` filters
 * as query parameters, parses the next-page cursor from the RFC 5988 `Link`
 * header, and reads the total count from the `X-Total-Count` header.
 *
 * @endpoint GET /v1/admin/notifications
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param filters - Recipient/sender/date-range/limit filters
 * @param cursor - Opaque pagination cursor for the requested page
 * @returns A page of notifications with `nextCursor` and `totalCount`
 * @throws SemaphoreError if the request fails
 */
export async function fetchAdminNotifications(
  semaphoreUrl: string,
  filters: AdminNotificationFilters = {},
  cursor?: string | null
): Promise<AdminNotificationsPage> {
  const baseUrl = normalizeUrl(semaphoreUrl);

  const params = new URLSearchParams();
  if (filters.recipient) params.set('recipient', filters.recipient);
  if (filters.sender) params.set('sender', filters.sender);
  if (filters.since) params.set('since', filters.since.toISOString());
  if (filters.until) params.set('until', filters.until.toISOString());
  if (filters.limit) params.set('limit', String(filters.limit));
  if (cursor) params.set('cursor', cursor);

  const queryString = params.toString();
  const url = `${baseUrl}/v1/admin/notifications${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  const entries = z.array(UserNotificationWithUrlSchema).parse(data);

  const nextCursor = parseCursorFromLink(response.headers.get('Link'));
  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader
    ? Number.parseInt(totalCountHeader, 10)
    : null;

  return { entries, nextCursor, totalCount };
}

/**
 * Fetch a single admin notification by id.
 *
 * @endpoint GET /v1/admin/notifications/{id}
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param id - Opaque notification id
 * @returns The notification record
 * @throws SemaphoreError if the request fails or the id is not found
 */
export async function fetchAdminNotification(
  semaphoreUrl: string,
  id: string
): Promise<UserNotification> {
  const baseUrl = normalizeUrl(semaphoreUrl);
  const url = `${baseUrl}/v1/admin/notifications/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return UserNotificationSchema.parse(data);
}

/**
 * Create a user notification via the Semaphore admin API.
 *
 * POSTs the `{ recipient, summary, body? }` payload with `credentials:
 * 'include'` and the Gafaelfawr `x-csrf-token` header — the same mutation
 * pattern used by `@lsst-sqre/gafaelfawr-client`. The CSRF token is sourced by
 * the caller from Gafaelfawr login info. The endpoint echoes back the created
 * notification (including its `url`).
 *
 * @endpoint POST /v1/admin/notifications
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param notification - The `{ recipient, summary, body? }` payload to create
 * @param csrfToken - CSRF token from Gafaelfawr login info
 * @returns The created notification, including its resource URL
 * @throws SemaphoreError if the request fails
 */
export async function createAdminNotification(
  semaphoreUrl: string,
  notification: CreateUserNotification,
  csrfToken: string
): Promise<UserNotificationWithUrl> {
  const baseUrl = normalizeUrl(semaphoreUrl);
  const url = `${baseUrl}/v1/admin/notifications`;

  // Validate and normalize the payload at the boundary: this strips any stray
  // keys and drops an undefined `body` so it is omitted from the request.
  const payload = CreateUserNotificationSchema.parse(notification);

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return UserNotificationWithUrlSchema.parse(data);
}

// =============================================================================
// User-facing notifications
// =============================================================================

/**
 * Fetch a page of the authenticated user's notifications.
 *
 * Targets the user-facing list endpoint, which returns
 * {@link UserNotificationSummarySchema} entries (with `summary` as
 * `FormattedText`, not raw Markdown). Applies the `unread` / `limit` filters
 * plus an opaque pagination `cursor`, parses the next-page cursor from the RFC
 * 5988 `Link` header, and reads the total from `X-Total-Count` (the latter two
 * are only present when `limit` is set). The request is authenticated via the
 * browser's session cookie (`credentials: 'include'`).
 *
 * @endpoint GET /v1/notifications
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param params - `unread` / `limit` filters and the pagination `cursor`
 * @returns A page of notification summaries with `nextCursor` and `totalCount`
 * @throws SemaphoreError if the request fails
 */
export async function fetchUserNotifications(
  semaphoreUrl: string,
  params: UserNotificationListParams = {}
): Promise<UserNotificationsPage> {
  const baseUrl = normalizeUrl(semaphoreUrl);

  const search = new URLSearchParams();
  if (params.unread) search.set('unread', 'true');
  if (params.limit) search.set('limit', String(params.limit));
  if (params.cursor) search.set('cursor', params.cursor);

  const queryString = search.toString();
  const url = `${baseUrl}/v1/notifications${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  const entries = z.array(UserNotificationSummarySchema).parse(data);

  const nextCursor = parseCursorFromLink(response.headers.get('Link'));
  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader
    ? Number.parseInt(totalCountHeader, 10)
    : null;

  return { entries, nextCursor, totalCount };
}

/**
 * Fetch a single user-facing notification by id.
 *
 * Returns a {@link UserNotificationFormattedSchema} with both `summary` and
 * `body` as `FormattedText`. Fetching the detail does **not** auto-mark the
 * notification read — that is an explicit action via {@link markNotificationsRead}.
 *
 * @endpoint GET /v1/notifications/{id}
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param id - Opaque notification id
 * @returns The full formatted notification
 * @throws SemaphoreError if the request fails or the id is not found
 */
export async function fetchUserNotification(
  semaphoreUrl: string,
  id: string
): Promise<UserNotificationFormatted> {
  const baseUrl = normalizeUrl(semaphoreUrl);
  const url = `${baseUrl}/v1/notifications/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return UserNotificationFormattedSchema.parse(data);
}

/**
 * Mark a set of the authenticated user's notifications read.
 *
 * POSTs `{ ids }` with `credentials: 'include'` and the Gafaelfawr
 * `x-csrf-token` header — the same mutation pattern used by
 * {@link createAdminNotification}. The endpoint is idempotent: already-read or
 * nonexistent ids are silently ignored and it responds with `204 No Content`,
 * so this function resolves to `void` on success.
 *
 * @endpoint POST /v1/notifications/read
 *
 * @param semaphoreUrl - Base URL of the Semaphore service
 * @param ids - The notification ids to mark read
 * @param csrfToken - CSRF token from Gafaelfawr login info
 * @throws SemaphoreError if the request fails
 */
export async function markNotificationsRead(
  semaphoreUrl: string,
  ids: string[],
  csrfToken: string
): Promise<void> {
  const baseUrl = normalizeUrl(semaphoreUrl);
  const url = `${baseUrl}/v1/notifications/read`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new SemaphoreError(
      `Semaphore API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }
}
