import { type BroadcastsResponse, BroadcastsResponseSchema } from './schemas';

export class SemaphoreError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'SemaphoreError';
  }
}

// Module-level cache for cross-request caching (server-side)
let cachedBroadcasts: BroadcastsResponse | null = null;
let cacheTimestamp = 0;
let cachedUrl: string | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
};

/**
 * Fetch broadcast messages from the Semaphore API.
 */
export async function fetchBroadcasts(
  semaphoreUrl: string,
  options?: FetchOptions
): Promise<BroadcastsResponse> {
  const { requestId, forceRefresh = false } = options ?? {};

  const logPrefix = requestId ? `[Semaphore:${requestId}]` : '[Semaphore]';
  const now = Date.now();

  // Check module-level cache
  if (
    !forceRefresh &&
    cachedBroadcasts &&
    cachedUrl === semaphoreUrl &&
    now - cacheTimestamp < CACHE_TTL
  ) {
    const cacheAge = Math.round((now - cacheTimestamp) / 1000);
    console.log(`${logPrefix} Using cached broadcasts (age: ${cacheAge}s)`);
    return cachedBroadcasts;
  }

  // Remove trailing slashes, then append /v1/broadcasts
  let baseUrl = semaphoreUrl;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const broadcastsUrl = `${baseUrl}/v1/broadcasts`;

  const startTime = Date.now();
  console.log(`${logPrefix} Starting network fetch from:`, broadcastsUrl);

  const response = await fetch(broadcastsUrl, { cache: 'no-store' });

  const fetchDuration = Date.now() - startTime;
  console.log(
    `${logPrefix} Network fetch completed in ${fetchDuration}ms, status: ${response.status}`
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
