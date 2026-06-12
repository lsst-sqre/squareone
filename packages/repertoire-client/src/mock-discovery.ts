import type { ServiceDiscovery } from './schemas';

/**
 * Hand-written mock data for deterministic tests and Storybook.
 *
 * This mirrors the live Repertoire 2.0.0 `/discovery` response for the
 * production RSP (`data.lsst.cloud`): the `dp1`/`dp02`/`dp03` datasets, each
 * exposing its full set of user-facing data services keyed by real semantic
 * version keys (`sia-query-2.0`, `soda-sync-1.0`, `soda-async-1.0`,
 * `hips-list-1.0`, `tables`, `gms-search-1.0`). `ivoa_standard_id` is not
 * populated in live data — the IVOA standard is encoded in the version key.
 *
 * Internal services (`gafaelfawr`, `times-square`) deliberately keep their
 * `v1` version key so the navigation/settings helpers
 * (`getGafaelfawrUrl()` / `getTimesSquareUrl()`) continue to resolve.
 */
export const mockDiscovery: ServiceDiscovery = {
  applications: [
    'datalinker',
    'gafaelfawr',
    'hips',
    'nublado',
    'portal',
    'semaphore',
    'sia',
    'squareone',
    'ssotap',
    'tap',
    'times-square',
    'vo-cutouts',
  ],
  environment_name: 'data.lsst.cloud',
  datasets: {
    dp1: {
      description:
        'Data Preview 1 contains image and catalog products from the Rubin' +
        ' Science Pipelines v29 processing of observations obtained with the' +
        ' LSST Commissioning Camera of seven ~1 square degree fields, over' +
        ' seven weeks in late 2024.',
      docs_url: 'https://dp1.lsst.io',
      butler_config: 'https://data.lsst.cloud/api/butler/repo/dp1/butler.yaml',
      services: {
        cutout: {
          url: 'https://data.lsst.cloud/api/cutout',
          openapi: 'https://data.lsst.cloud/api/cutout/openapi.json',
          versions: {
            'soda-sync-1.0': {
              url: 'https://data.lsst.cloud/api/cutout/dp1/sync',
            },
            'soda-async-1.0': {
              url: 'https://data.lsst.cloud/api/cutout/dp1/jobs',
            },
          },
        },
        datalink: {
          url: 'https://data.lsst.cloud/api/datalink',
          openapi: null,
          versions: {},
        },
        gms: {
          url: 'https://data.lsst.cloud/auth/gms',
          openapi: null,
          versions: {
            'gms-search-1.0': {
              url: 'https://data.lsst.cloud/auth/gms',
            },
          },
        },
        hips: {
          url: 'https://data.lsst.cloud/api/hips/v2/dp1/list',
          openapi: null,
          versions: {
            'hips-list-1.0': {
              url: 'https://data.lsst.cloud/api/hips/v2/dp1/list',
            },
          },
        },
        sia: {
          url: 'https://data.lsst.cloud/api/sia/dp1',
          openapi: 'https://data.lsst.cloud/api/sia/openapi.json',
          versions: {
            'sia-query-2.0': {
              url: 'https://data.lsst.cloud/api/sia/dp1/query',
            },
          },
        },
        tap: {
          url: 'https://data.lsst.cloud/api/tap',
          openapi: null,
          versions: {
            tables: {
              url: 'https://data.lsst.cloud/api/tap/tables',
            },
          },
        },
      },
    },
    dp02: {
      description:
        'Data Preview 0.2 contains the image and catalog products of the' +
        ' Rubin Science Pipelines v23 processing of the DESC Data Challenge 2' +
        ' simulation, which covered 300 square degrees of the wide-fast-deep' +
        ' LSST survey region over 5 years.',
      docs_url: 'https://dp0-2.lsst.io',
      butler_config: 'https://data.lsst.cloud/api/butler/repo/dp02/butler.yaml',
      services: {
        cutout: {
          url: 'https://data.lsst.cloud/api/cutout',
          openapi: 'https://data.lsst.cloud/api/cutout/openapi.json',
          versions: {
            'soda-sync-1.0': {
              url: 'https://data.lsst.cloud/api/cutout/dp02/sync',
            },
            'soda-async-1.0': {
              url: 'https://data.lsst.cloud/api/cutout/dp02/jobs',
            },
          },
        },
        datalink: {
          url: 'https://data.lsst.cloud/api/datalink',
          openapi: null,
          versions: {},
        },
        gms: {
          url: 'https://data.lsst.cloud/auth/gms',
          openapi: null,
          versions: {
            'gms-search-1.0': {
              url: 'https://data.lsst.cloud/auth/gms',
            },
          },
        },
        hips: {
          url: 'https://data.lsst.cloud/api/hips/v2/dp02/list',
          openapi: null,
          versions: {
            'hips-list-1.0': {
              url: 'https://data.lsst.cloud/api/hips/v2/dp02/list',
            },
          },
        },
        sia: {
          url: 'https://data.lsst.cloud/api/sia/dp02',
          openapi: 'https://data.lsst.cloud/api/sia/openapi.json',
          versions: {
            'sia-query-2.0': {
              url: 'https://data.lsst.cloud/api/sia/dp02/query',
            },
          },
        },
        tap: {
          url: 'https://data.lsst.cloud/api/tap',
          openapi: null,
          versions: {
            tables: {
              url: 'https://data.lsst.cloud/api/tap/tables',
            },
          },
        },
      },
    },
    dp03: {
      description:
        'Data Preview 0.3 contains the catalog products of a Solar System' +
        ' Science Collaboration simulation of the results of SSO analysis of' +
        ' the wide-fast-deep data from the LSST dataset.',
      docs_url: 'https://dp0-3.lsst.io',
      butler_config: null,
      services: {
        cutout: {
          url: 'https://data.lsst.cloud/api/cutout',
          openapi: 'https://data.lsst.cloud/api/cutout/openapi.json',
          versions: {
            'soda-sync-1.0': {
              url: 'https://data.lsst.cloud/api/cutout/dp03/sync',
            },
            'soda-async-1.0': {
              url: 'https://data.lsst.cloud/api/cutout/dp03/jobs',
            },
          },
        },
        gms: {
          url: 'https://data.lsst.cloud/auth/gms',
          openapi: null,
          versions: {
            'gms-search-1.0': {
              url: 'https://data.lsst.cloud/auth/gms',
            },
          },
        },
        tap: {
          url: 'https://data.lsst.cloud/api/ssotap',
          openapi: null,
          versions: {
            tables: {
              url: 'https://data.lsst.cloud/api/ssotap/tables',
            },
          },
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
        openapi: 'https://data.lsst.cloud/semaphore/openapi.json',
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
      // UI services only have a url field per the OpenAPI spec.
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
