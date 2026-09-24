import type { DataService, ServiceDiscovery } from './schemas';

/**
 * Hand-written mock data for deterministic tests and Storybook.
 *
 * The URLs mirror the live `/discovery` response for the production RSP
 * (`data.lsst.cloud`): the `dp1`/`dp02`/`dp03`/`prompt` datasets, each
 * exposing its user-facing data services keyed by real semantic version keys
 * (`sia-query-2.0`, `soda-sync-1.0`, `soda-async-1.0`, `hips-list-1.0`,
 * `tables`, `gms-search-1.0`).
 *
 * The Repertoire 3.0.0 metadata mirrors what data-dev publishes (production is
 * still on 2.x): the `environment` object (with the idfprod values from
 * Phalanx, so it agrees with `environment_name` and the URLs), service
 * `title`s and `docs_url`s, `required_scopes` (portal `exec:portal`, nublado
 * `exec:notebook`, kafdrop `exec:internal-tools`, webdav `write:files`; Argo
 * CD and Chronograf declare none), and the Gafaelfawr `quota_labels` of the
 * data and internal services. `prompt` has no `docs_url`, as on data-dev.
 *
 * Internal services (`gafaelfawr`, `times-square`) deliberately keep their
 * `v1` version key so the navigation/settings helpers
 * (`getGafaelfawrUrl()` / `getTimesSquareUrl()`) continue to resolve.
 */

const BASE = 'https://data.lsst.cloud';

function cutoutService(): DataService {
  return {
    url: `${BASE}/api/cutout`,
    title: 'SODA image cutouts',
    docs_url: 'https://www.ivoa.net/documents/SODA/',
    required_scopes: ['read:image'],
    openapi: `${BASE}/api/cutout/openapi.json`,
    quota_labels: {
      'vo-cutouts': { title: 'SODA API calls', internal: false },
    },
    versions: {
      'soda-sync-1.0': {
        url: `${BASE}/api/cutout/sync`,
      },
      'soda-async-1.0': {
        url: `${BASE}/api/cutout/jobs`,
      },
    },
  };
}

function datalinkService(): DataService {
  return {
    url: `${BASE}/api/datalink`,
    title: 'DataLink',
    docs_url: 'https://www.ivoa.net/documents/DataLink/',
    required_scopes: ['read:image'],
    openapi: `${BASE}/api/datalink/openapi.json`,
    quota_labels: {
      datalinker: { title: 'DataLink {links} requests', internal: false },
    },
    versions: {
      'datalink-links-1.1': {
        url: `${BASE}/api/datalink/links`,
      },
    },
  };
}

function gmsService(): DataService {
  return {
    url: `${BASE}/auth/gms`,
    title: 'Group membership service (GMS)',
    docs_url: 'https://www.ivoa.net/documents/GMS/',
    required_scopes: [],
    openapi: null,
    quota_labels: {},
    versions: {
      'gms-search-1.0': {
        url: `${BASE}/auth/gms`,
      },
    },
  };
}

function hipsService(dataset: string): DataService {
  return {
    url: `${BASE}/api/hips/v2/${dataset}/list`,
    title: 'HiPS (Hierarchical Progressive Survey)',
    docs_url: 'https://www.ivoa.net/documents/HiPS/',
    required_scopes: ['read:image'],
    openapi: null,
    quota_labels: {
      hips: { title: 'HiPS requests', internal: false },
    },
    versions: {
      'hips-list-1.0': {
        url: `${BASE}/api/hips/v2/${dataset}/list`,
      },
    },
  };
}

function siaService(dataset: string): DataService {
  return {
    url: `${BASE}/api/sia/${dataset}`,
    title: 'Simple image access (SIA)',
    docs_url: 'https://www.ivoa.net/documents/SIA/',
    required_scopes: ['read:image'],
    openapi: `${BASE}/api/sia/openapi.json`,
    quota_labels: {
      sia: { title: 'Image requests', internal: false },
    },
    versions: {
      'sia-query-2.0': {
        url: `${BASE}/api/sia/${dataset}/query`,
      },
    },
  };
}

/**
 * A TAP service at `/api/<path>`. Only the main TAP service carries the `tap`
 * quota label; SSO TAP and PPDB TAP declare none on data-dev.
 */
function tapService(path: string, withQuotaLabel: boolean): DataService {
  return {
    url: `${BASE}/api/${path}`,
    title: 'Table access protocol (TAP)',
    docs_url: 'https://www.ivoa.net/documents/TAP/',
    required_scopes: ['read:tap'],
    openapi: null,
    quota_labels: withQuotaLabel
      ? { tap: { title: 'TAP API calls', internal: false } }
      : {},
    versions: {
      tables: {
        url: `${BASE}/api/${path}/tables`,
      },
    },
  };
}

const OBSCORE_CONFIG_BASE =
  'https://raw.githubusercontent.com/lsst-dm/dax_obscore/refs/heads/main/configs';

export const mockDiscovery: ServiceDiscovery = {
  applications: [
    'argocd',
    'datalinker',
    'gafaelfawr',
    'herald',
    'hips',
    'muster',
    'nublado',
    'portal',
    'ppdbtap',
    'repertoire',
    'sasquatch',
    'semaphore',
    'sia',
    'squareone',
    'ssotap',
    'tap',
    'times-square',
    'vo-cutouts',
  ],
  environment: {
    name: 'data.lsst.cloud',
    label: 'idfprod',
    title: 'US Rubin Science Platform',
    title_long: 'US Rubin Science Platform',
    description:
      'The primary US Rubin Science Platform, hosted on Google Cloud' +
      ' Platform. This environment serves as the public Rubin Science' +
      ' Platform for the Data Previews.',
    docs_url: 'https://phalanx.lsst.io/environments/idfprod/',
  },
  environment_name: 'data.lsst.cloud',
  datasets: {
    dp1: {
      description:
        'Data Preview 1 contains image and catalog products from the Rubin' +
        ' Science Pipelines v29 processing of observations obtained with the' +
        ' LSST Commissioning Camera of seven ~1 square degree fields, over' +
        ' seven weeks in late 2024.',
      docs_url: 'https://dp1.lsst.io',
      butler_config: `${BASE}/api/butler/repo/dp1/butler.yaml`,
      obscore_config: `${OBSCORE_CONFIG_BASE}/dp1.yaml`,
      services: {
        cutout: cutoutService(),
        datalink: datalinkService(),
        gms: gmsService(),
        hips: hipsService('dp1'),
        sia: siaService('dp1'),
        tap: tapService('tap', true),
      },
    },
    dp02: {
      description:
        'Data Preview 0.2 contains the image and catalog products of the' +
        ' Rubin Science Pipelines v23 processing of the DESC Data Challenge 2' +
        ' simulation, which covered 300 square degrees of the wide-fast-deep' +
        ' LSST survey region over 5 years.',
      docs_url: 'https://dp0-2.lsst.io',
      butler_config: `${BASE}/api/butler/repo/dp02/butler.yaml`,
      obscore_config: `${OBSCORE_CONFIG_BASE}/dp02.yaml`,
      services: {
        cutout: cutoutService(),
        datalink: datalinkService(),
        gms: gmsService(),
        hips: hipsService('dp02'),
        sia: siaService('dp02'),
        tap: tapService('tap', true),
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
        gms: gmsService(),
        tap: tapService('ssotap', false),
      },
    },
    // Prompt products have no docs_url (as on data-dev).
    prompt: {
      description: 'Prompt products.',
      obscore_config: `${OBSCORE_CONFIG_BASE}/prompt.yaml`,
      services: {
        alerts: {
          url: `${BASE}/api/alerts`,
          title: 'Alert retrieval',
          docs_url: 'https://sqr-114.lsst.io/',
          required_scopes: ['read:image'],
          openapi: `${BASE}/api/alerts/openapi.json`,
          quota_labels: {
            herald: { title: 'Alert requests', internal: false },
          },
          versions: {},
        },
        gms: gmsService(),
        tap: tapService('ppdbtap', false),
      },
    },
  },
  services: {
    internal: {
      datalink: {
        url: `${BASE}/api/datalink`,
        title: 'DataLink',
        required_scopes: ['read:image'],
        openapi: `${BASE}/api/datalink/openapi.json`,
        quota_labels: {
          datalinker: { title: 'DataLink {links} requests', internal: false },
        },
        versions: {
          'datalink-links-1.1': {
            url: `${BASE}/api/datalink/links`,
          },
        },
      },
      gafaelfawr: {
        url: `${BASE}/auth`,
        docs_url: 'https://gafaelfawr.lsst.io/',
        required_scopes: [],
        openapi: `${BASE}/auth/openapi.json`,
        quota_labels: {},
        versions: {
          v1: {
            url: `${BASE}/auth/api/v1`,
          },
        },
      },
      // Muster declares neither a title nor a docs URL on data-dev, and its
      // quota label is not (yet) flagged internal.
      muster: {
        url: `${BASE}/muster`,
        required_scopes: [],
        openapi: `${BASE}/muster/openapi.json`,
        quota_labels: {
          'muster-quota': { title: 'Quota testing', internal: false },
        },
        versions: {},
      },
      semaphore: {
        url: `${BASE}/semaphore`,
        docs_url: 'https://semaphore.lsst.io/',
        required_scopes: [],
        openapi: `${BASE}/semaphore/openapi.json`,
        quota_labels: {},
        versions: {},
      },
      // Times Square is only an internal service (no services.ui entry).
      'times-square': {
        url: `${BASE}/times-square/api`,
        docs_url: 'https://times-square.lsst.io/',
        required_scopes: ['exec:admin'],
        openapi: `${BASE}/times-square/api/openapi.json`,
        quota_labels: {},
        versions: {
          v1: {
            url: `${BASE}/times-square/api/v1`,
          },
        },
      },
    },
    ui: {
      portal: {
        url: `${BASE}/portal/app`,
        title: 'Portal aspect',
        required_scopes: ['exec:portal'],
      },
      nublado: {
        url: `${BASE}/nb`,
        title: 'Notebook aspect',
        docs_url: 'https://nublado.lsst.io/',
        required_scopes: ['exec:notebook'],
      },
      argocd: {
        url: `${BASE}/argo-cd`,
        title: 'Argo CD',
        docs_url: 'https://argo-cd.readthedocs.io/en/stable/',
        required_scopes: [],
      },
      chronograf: {
        url: `${BASE}/chronograf`,
        title: 'Chronograf metrics viewer',
        required_scopes: [],
      },
      kafdrop: {
        url: `${BASE}/kafdrop`,
        title: 'Kafdrop Kafka viewer',
        required_scopes: ['exec:internal-tools'],
      },
      webdav: {
        url: `${BASE}/files`,
        title: 'WebDAV server',
        required_scopes: ['write:files'],
      },
      comanage: {
        url: 'https://id.lsst.cloud/',
        title: 'Account settings',
        required_scopes: [],
      },
      settings: {
        url: `${BASE}/settings`,
        title: 'User settings',
        required_scopes: [],
      },
      logout: {
        url: `${BASE}/logout`,
        title: 'User logout',
        required_scopes: [],
      },
      squareone: {
        url: `${BASE}/`,
        title: 'Home page',
        docs_url: 'https://squareone.lsst.io/',
        required_scopes: [],
      },
    },
  },
  influxdb_databases: {},
};
