import { z } from 'zod';
import {
  type BroadcastsResponse,
  BroadcastsResponseSchema,
  type UserNotification,
  UserNotificationSchema,
  UserNotificationWithUrlSchema,
} from './schemas';
import type { AdminNotificationFilters, AdminNotificationsPage } from './types';

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
