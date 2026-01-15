import { DiscoverySchema, type ServiceDiscovery } from './schemas';

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
};

export async function fetchServiceDiscovery(
  repertoireUrl: string,
  options?: FetchOptions
): Promise<ServiceDiscovery> {
  const { requestId, forceRefresh = false } = options ?? {};

  const logPrefix = requestId ? `[Repertoire:${requestId}]` : '[Repertoire]';
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
    console.log(`${logPrefix} Using cached discovery (age: ${cacheAge}s)`);
    return cachedDiscovery;
  }

  // Remove trailing slashes if present, then append /discovery
  let baseUrl = repertoireUrl;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const discoveryUrl = `${baseUrl}/discovery`;

  const startTime = Date.now();
  console.log(`${logPrefix} Starting network fetch from:`, discoveryUrl);

  const response = await fetch(discoveryUrl, { cache: 'no-store' });

  const fetchDuration = Date.now() - startTime;
  console.log(
    `${logPrefix} Network fetch completed in ${fetchDuration}ms, status: ${response.status}`
  );

  if (!response.ok) {
    throw new RepertoireError(
      `Repertoire API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  console.log(`${logPrefix} Raw response:`, JSON.stringify(data, null, 2));

  const parsed = DiscoverySchema.parse(data);
  console.log(`${logPrefix} Parsed discovery:`, {
    applications: parsed.applications,
    uiServices: Object.keys(parsed.services.ui),
    internalServices: Object.keys(parsed.services.internal),
    hasPortalUi: 'portal' in parsed.services.ui,
    hasNubladoUi: 'nublado' in parsed.services.ui,
    portalUrl: parsed.services.ui.portal?.url,
    nubladoUrl: parsed.services.ui.nublado?.url,
  });

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
