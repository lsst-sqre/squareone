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

export async function fetchServiceDiscovery(
  repertoireUrl: string,
  requestId?: string
): Promise<ServiceDiscovery> {
  const logPrefix = requestId ? `[Repertoire:${requestId}]` : '[Repertoire]';

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
