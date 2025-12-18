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
  const response = await fetch(repertoireUrl, { cache: 'no-store' });

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
