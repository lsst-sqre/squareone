import { defaultLogger, type Logger } from '@lsst-sqre/api-client-core';
import { DiscoverySchema, type ServiceDiscovery } from './schemas';

// The `Logger` type's single source of truth now lives in
// `@lsst-sqre/api-client-core`; re-export it here so existing
// `@lsst-sqre/repertoire-client` imports keep compiling.
export type { Logger } from '@lsst-sqre/api-client-core';

export class RepertoireError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'RepertoireError';
  }
}

// Module-level cache for cross-request caching (server-side)
// This persists across requests within the same Node.js process
let cachedDiscovery: ServiceDiscovery | null = null;
let cacheTimestamp = 0;
let cachedUrl: string | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the module-level cache. Primarily for testing.
 */
export function clearDiscoveryCache(): void {
  cachedDiscovery = null;
  cacheTimestamp = 0;
  cachedUrl = null;
}

export type FetchOptions = {
  requestId?: string;
  forceRefresh?: boolean;
  logger?: Logger;
};

export async function fetchServiceDiscovery(
  repertoireUrl: string,
  options?: FetchOptions
): Promise<ServiceDiscovery> {
  const {
    requestId,
    forceRefresh = false,
    logger: log = defaultLogger,
  } = options ?? {};

  const now = Date.now();

  // Check module-level cache (server-side cross-request caching)
  // Skip cache if forceRefresh is true (e.g., manual refetch from client)
  if (
    !forceRefresh &&
    cachedDiscovery &&
    cachedUrl === repertoireUrl &&
    now - cacheTimestamp < CACHE_TTL
  ) {
    const cacheAge = Math.round((now - cacheTimestamp) / 1000);
    log.debug({ requestId, cacheAge }, 'Using cached discovery');
    return cachedDiscovery;
  }

  // Remove trailing slashes if present, then append /discovery
  let baseUrl = repertoireUrl;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const discoveryUrl = `${baseUrl}/discovery`;

  const startTime = Date.now();
  log.debug({ requestId, discoveryUrl }, 'Starting network fetch');

  const response = await fetch(discoveryUrl, { cache: 'no-store' });

  const fetchDuration = Date.now() - startTime;
  log.debug(
    { requestId, fetchDuration, status: response.status },
    'Network fetch completed'
  );

  if (!response.ok) {
    throw new RepertoireError(
      `Repertoire API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  log.debug({ requestId, rawResponse: data }, 'Raw response received');

  const parsed = DiscoverySchema.parse(data);
  log.debug(
    {
      requestId,
      applications: parsed.applications,
      uiServices: Object.keys(parsed.services.ui),
      internalServices: Object.keys(parsed.services.internal),
    },
    'Parsed discovery'
  );

  // Update module-level cache
  cachedDiscovery = parsed;
  cachedUrl = repertoireUrl;
  cacheTimestamp = now;

  return parsed;
}

export function getEmptyDiscovery(): ServiceDiscovery {
  return {
    applications: [],
    datasets: {},
    influxdb_databases: {},
    services: { internal: {}, ui: {} },
  };
}
