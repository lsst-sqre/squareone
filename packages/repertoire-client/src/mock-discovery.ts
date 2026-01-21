import type { ServiceDiscovery } from './schemas';

/**
 * Hand-written mock data for deterministic tests and Storybook.
 * This mock represents a typical RSP deployment configuration.
 */
export const mockDiscovery: ServiceDiscovery = {
  applications: ['portal', 'nublado', 'times-square', 'vo-cutouts', 'tap'],
  datasets: {
    'dp0.2': {
      description: 'Data Preview 0.2',
      docs_url: 'https://dp0-2.lsst.io',
      butler_config: null,
      services: {
        tap: {
          url: 'https://data.lsst.cloud/api/tap',
          openapi: null,
          versions: {},
        },
        sia: {
          url: 'https://data.lsst.cloud/api/sia',
          openapi: null,
          versions: {},
        },
      },
    },
    dp1: {
      description: 'Data Preview 1',
      docs_url: 'https://dp1.lsst.io',
      butler_config: 'https://data.lsst.cloud/api/butler/repo/dp1/butler.yaml',
      services: {
        tap: {
          url: 'https://data.lsst.cloud/api/tap',
          openapi: null,
          versions: {},
        },
      },
    },
  },
  services: {
    internal: {
      gafaelfawr: {
        url: 'https://data.lsst.cloud/auth',
        openapi: 'https://data.lsst.cloud/auth/openapi.json',
        versions: {
          v1: {
            url: 'https://data.lsst.cloud/auth/api/v1',
          },
        },
      },
      semaphore: {
        url: 'https://data.lsst.cloud/semaphore',
        openapi: null,
        versions: {},
      },
      'times-square': {
        url: 'https://data.lsst.cloud/times-square/api',
        openapi: 'https://data.lsst.cloud/times-square/api/openapi.json',
        versions: {
          v1: {
            url: 'https://data.lsst.cloud/times-square/api/v1',
          },
        },
      },
    },
    ui: {
      // UI services only have url field per OpenAPI spec
      portal: {
        url: 'https://data.lsst.cloud/portal/app',
      },
      nublado: {
        url: 'https://data.lsst.cloud/nb',
      },
    },
  },
  influxdb_databases: {},
};
