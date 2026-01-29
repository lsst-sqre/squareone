import { type BroadcastsResponse, BroadcastsResponseSchema } from './schemas';

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
  let baseUrl = semaphoreUrl;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const broadcastsUrl = `${baseUrl}/v1/broadcasts`;

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
