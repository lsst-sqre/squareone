// Core fetch client - placeholder
import type { ServiceDiscovery } from './types';

export async function fetchServiceDiscovery(
  _repertoireUrl: string
): Promise<ServiceDiscovery> {
  throw new Error('Not implemented');
}

export function getEmptyDiscovery(): ServiceDiscovery {
  return {
    applications: [],
    datasets: {},
    influxdb_databases: {},
    services: { internal: {}, ui: {} },
  };
}
