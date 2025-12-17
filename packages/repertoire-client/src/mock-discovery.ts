// Mock discovery data for development - placeholder
import type { ServiceDiscovery } from './types';

export const mockDiscovery: ServiceDiscovery = {
  applications: [],
  datasets: {},
  influxdb_databases: {},
  services: { internal: {}, ui: {} },
};
