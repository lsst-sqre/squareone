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
  repertoireUrl: string
): Promise<ServiceDiscovery> {
  // Remove trailing slashes if present, then append /discovery
  let baseUrl = repertoireUrl;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const discoveryUrl = `${baseUrl}/discovery`;

  const response = await fetch(discoveryUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new RepertoireError(
      `Repertoire API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return DiscoverySchema.parse(data); // Validates and returns typed response
}

export function getEmptyDiscovery(): ServiceDiscovery {
  return {
    applications: [],
    datasets: {},
    influxdb_databases: {},
    services: { internal: {}, ui: {} },
  };
}
