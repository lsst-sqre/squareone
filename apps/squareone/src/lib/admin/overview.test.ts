import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import {
  buildApplicationLinks,
  buildDatasetRows,
  buildInfluxRows,
  buildServiceRows,
  filterServiceRows,
  getDiscoveryEndpointUrl,
  getEnvironmentSummary,
  getOperatorLinks,
  isEmptyDiscovery,
  PHALANX_APPLICATION_DOCS_BASE,
} from './overview';

const REPERTOIRE_URL = 'https://data-dev.lsst.cloud/repertoire';

/** A discovery that lists the given applications and services only. */
function discoveryWith({
  applications,
  ui = {},
  internal = {},
}: {
  applications: string[];
  ui?: ServiceDiscovery['services']['ui'];
  internal?: ServiceDiscovery['services']['internal'];
}): ServiceDiscovery {
  return {
    ...getEmptyDiscovery(),
    applications,
    services: { ui, internal },
  };
}

/** A minimal internal (API) service entry. */
function internalService(
  url: string,
  extra: Partial<ServiceDiscovery['services']['internal'][string]> = {}
): ServiceDiscovery['services']['internal'][string] {
  return {
    url,
    required_scopes: [],
    quota_labels: {},
    versions: {},
    ...extra,
  };
}

/** A copy of `discovery` without the named UI services. */
function withoutUiServices(
  discovery: ServiceDiscovery,
  ...names: string[]
): ServiceDiscovery {
  const ui = { ...discovery.services.ui };
  for (const name of names) {
    delete ui[name];
  }
  return { ...discovery, services: { ...discovery.services, ui } };
}

describe('getEnvironmentSummary', () => {
  test('summarizes the Repertoire 3.0 environment object', () => {
    expect(getEnvironmentSummary(mockDiscoveryDataDev)).toEqual({
      name: 'data-dev.lsst.cloud',
      label: 'idfdev',
      title: 'SQuaRE RSP development',
      titleLong: 'SQuaRE RSP development',
      description: expect.stringMatching(/^A development environment/),
      docsUrl: 'https://phalanx.lsst.io/environments/idfdev/',
    });
  });

  test('falls back to a name-only summary from the 2.x environment_name', () => {
    expect(getEnvironmentSummary(mockDiscovery2x)).toEqual({
      name: 'data.lsst.cloud',
      label: null,
      title: null,
      titleLong: null,
      description: null,
      docsUrl: null,
    });
  });

  test('prefers environment over the deprecated environment_name', () => {
    const discovery: ServiceDiscovery = {
      ...mockDiscoveryDataDev,
      environment_name: 'stale-name',
    };

    expect(getEnvironmentSummary(discovery)?.name).toBe('data-dev.lsst.cloud');
  });

  test('reports a missing or blank description as null', () => {
    const environment = mockDiscoveryDataDev.environment;
    const withoutDescription: ServiceDiscovery = {
      ...mockDiscoveryDataDev,
      environment: { ...environment, description: null },
    };
    const blankDescription: ServiceDiscovery = {
      ...mockDiscoveryDataDev,
      environment: { ...environment, description: '  ' },
    };

    expect(getEnvironmentSummary(withoutDescription)?.description).toBeNull();
    expect(getEnvironmentSummary(blankDescription)?.description).toBeNull();
  });

  test('returns null when discovery names no environment at all', () => {
    expect(getEnvironmentSummary(getEmptyDiscovery())).toBeNull();
  });
});

describe('isEmptyDiscovery', () => {
  test('is true for the empty discovery a failed fetch resolves to', () => {
    expect(isEmptyDiscovery(getEmptyDiscovery())).toBe(true);
  });

  test('is false for a populated 3.0 or 2.x discovery', () => {
    expect(isEmptyDiscovery(mockDiscoveryDataDev)).toBe(false);
    expect(isEmptyDiscovery(mockDiscovery2x)).toBe(false);
  });

  test('is false when discovery names only the environment', () => {
    expect(
      isEmptyDiscovery({ ...getEmptyDiscovery(), environment_name: 'x' })
    ).toBe(false);
  });
});

describe('getDiscoveryEndpointUrl', () => {
  test('appends /discovery to the Repertoire URL', () => {
    expect(getDiscoveryEndpointUrl(REPERTOIRE_URL)).toBe(
      'https://data-dev.lsst.cloud/repertoire/discovery'
    );
  });

  test('drops trailing slashes from the Repertoire URL first', () => {
    expect(getDiscoveryEndpointUrl(`${REPERTOIRE_URL}//`)).toBe(
      'https://data-dev.lsst.cloud/repertoire/discovery'
    );
  });
});

describe('getOperatorLinks', () => {
  test('links the data-dev operator tools, environment docs, and discovery', () => {
    const links = getOperatorLinks(mockDiscoveryDataDev);

    expect(links.map((link) => link.id)).toEqual([
      'argocd',
      'chronograf',
      'kafdrop',
      'environment-docs',
      'discovery',
    ]);
  });

  test('labels a service by its discovery title and links its docs', () => {
    const [argocd] = getOperatorLinks(mockDiscoveryDataDev);

    expect(argocd).toEqual({
      id: 'argocd',
      label: 'Argo CD',
      description: expect.any(String),
      url: 'https://data-dev.lsst.cloud/argo-cd',
      docsUrl: 'https://argo-cd.readthedocs.io/en/stable/',
    });
  });

  test('has no docs link for a service without a docs_url', () => {
    const chronograf = getOperatorLinks(mockDiscoveryDataDev).find(
      (link) => link.id === 'chronograf'
    );

    expect(chronograf).toMatchObject({
      label: 'Chronograf metrics viewer',
      url: 'https://data-dev.lsst.cloud/chronograf',
      docsUrl: null,
    });
  });

  test('falls back to a fixed name for a service without a title', () => {
    const links = getOperatorLinks(mockDiscovery2x);

    expect(links.slice(0, 3).map(({ label, url }) => ({ label, url }))).toEqual(
      [
        { label: 'Argo CD', url: 'https://data.lsst.cloud/argo-cd' },
        { label: 'Chronograf', url: 'https://data.lsst.cloud/chronograf' },
        { label: 'Kafdrop', url: 'https://data.lsst.cloud/kafdrop' },
      ]
    );
  });

  test.each(['argocd', 'chronograf', 'kafdrop'])(
    'omits %s when discovery has no such UI service',
    (service) => {
      const links = getOperatorLinks(
        withoutUiServices(mockDiscoveryDataDev, service)
      );

      const ids = links.map((link) => link.id);
      expect(ids).not.toContain(service);
      expect(ids).toHaveLength(4);
    }
  );

  test('links the environment docs from environment.docs_url', () => {
    const docs = getOperatorLinks(mockDiscoveryDataDev).find(
      (link) => link.id === 'environment-docs'
    );

    expect(docs?.url).toBe('https://phalanx.lsst.io/environments/idfdev/');
  });

  test('omits the environment docs link when discovery has no environment', () => {
    const ids = getOperatorLinks(mockDiscovery2x).map((link) => link.id);

    expect(ids).not.toContain('environment-docs');
  });

  test('links the service discovery page even with no operator services', () => {
    const links = getOperatorLinks(
      withoutUiServices(mockDiscovery2x, 'argocd', 'chronograf', 'kafdrop')
    );

    expect(links).toEqual([
      expect.objectContaining({
        id: 'discovery',
        url: '/admin/discovery',
        docsUrl: null,
      }),
    ]);
  });
});

describe('buildApplicationLinks', () => {
  test('links each application to its Phalanx docs page, in discovery order', () => {
    const links = buildApplicationLinks(mockDiscoveryDataDev);

    expect(links).toHaveLength(41);
    expect(links.map((link) => link.name)).toEqual(
      mockDiscoveryDataDev.applications
    );
    expect(links.find((link) => link.name === 'nublado')).toEqual({
      name: 'nublado',
      docsUrl: 'https://phalanx.lsst.io/applications/nublado/',
    });
  });

  test('builds each URL from the Phalanx applications docs base', () => {
    expect(PHALANX_APPLICATION_DOCS_BASE).toBe(
      'https://phalanx.lsst.io/applications'
    );
    expect(
      buildApplicationLinks(mockDiscovery2x).every(
        (link) =>
          link.docsUrl === `${PHALANX_APPLICATION_DOCS_BASE}/${link.name}/`
      )
    ).toBe(true);
  });

  test('encodes an application name as one URL path segment', () => {
    const [link] = buildApplicationLinks(
      discoveryWith({ applications: ['odd name/with?chars'] })
    );

    expect(link).toEqual({
      name: 'odd name/with?chars',
      docsUrl:
        'https://phalanx.lsst.io/applications/odd%20name%2Fwith%3Fchars/',
    });
  });

  test('has no links when discovery lists no applications', () => {
    expect(buildApplicationLinks(getEmptyDiscovery())).toEqual([]);
  });
});

describe('buildServiceRows', () => {
  test('lists the UI services, then the API services, each in discovery order', () => {
    const rows = buildServiceRows(mockDiscoveryDataDev);

    expect(rows.map(({ kind, name }) => `${kind} ${name}`)).toEqual([
      'UI argocd',
      'UI comanage',
      'UI logout',
      'UI nublado',
      'UI webdav',
      'UI portal',
      'UI chronograf',
      'UI kafdrop',
      'UI settings',
      'UI squareone',
      'API datalink',
      'API gafaelfawr',
      'API login',
      'API mobu',
      'API muster',
      'API noteburst',
      'API nublado-controller',
      'API repertoire',
      'API semaphore',
      'API times-square',
      'API wobbly',
    ]);
  });

  test('describes an API service with its scopes, docs, and OpenAPI spec', () => {
    const row = buildServiceRows(mockDiscoveryDataDev).find(
      (candidate) => candidate.name === 'nublado-controller'
    );

    expect(row).toEqual({
      id: 'API:nublado-controller',
      kind: 'API',
      name: 'nublado-controller',
      title: null,
      url: 'https://data-dev.lsst.cloud/nublado',
      requiredScopes: ['admin:jupyterlab'],
      docsUrl: null,
      openapiUrl: 'https://data-dev.lsst.cloud/nublado/openapi.json',
    });
  });

  test('describes a UI service with its title, scopes, and docs', () => {
    const row = buildServiceRows(mockDiscoveryDataDev).find(
      (candidate) => candidate.id === 'UI:nublado'
    );

    expect(row).toEqual({
      id: 'UI:nublado',
      kind: 'UI',
      name: 'nublado',
      title: 'Notebook aspect',
      url: 'https://nb.data-dev.lsst.cloud/nb',
      requiredScopes: ['exec:notebook'],
      docsUrl: 'https://nublado.lsst.io/',
      openapiUrl: null,
    });
  });

  test('keys a UI and an API service of the same name apart', () => {
    const rows = buildServiceRows(
      discoveryWith({
        applications: [],
        ui: { hips: { url: 'https://example.org/hips', required_scopes: [] } },
        internal: {
          hips: internalService('https://example.org/api/hips'),
        },
      })
    );

    expect(rows.map((row) => row.id)).toEqual(['UI:hips', 'API:hips']);
  });

  test('reports a missing or blank title as null', () => {
    const rows = buildServiceRows(
      discoveryWith({
        applications: [],
        ui: {
          missing: { url: 'https://example.org/missing', required_scopes: [] },
          blank: {
            url: 'https://example.org/blank',
            title: '  ',
            required_scopes: [],
          },
        },
        internal: {
          empty: internalService('https://example.org/empty', { title: '' }),
          nulled: internalService('https://example.org/nulled', {
            title: null,
          }),
        },
      })
    );

    expect(rows.map((row) => row.title)).toEqual([null, null, null, null]);
  });

  test('lists each required scope once', () => {
    const [row] = buildServiceRows(
      discoveryWith({
        applications: [],
        internal: {
          tap: internalService('https://example.org/api/tap', {
            required_scopes: ['read:tap', 'exec:notebook', 'read:tap'],
          }),
        },
      })
    );

    expect(row.requiredScopes).toEqual(['read:tap', 'exec:notebook']);
  });

  test('never gives a UI service an OpenAPI link', () => {
    const rows = buildServiceRows(mockDiscoveryDataDev);

    expect(
      rows.filter((row) => row.kind === 'UI').map((row) => row.openapiUrl)
    ).toEqual(Array(10).fill(null));
    expect(
      rows
        .filter((row) => row.kind === 'API' && !row.openapiUrl)
        .map((row) => row.name)
    ).toEqual(['login']);
  });

  test('has no titles, scopes, or docs under Repertoire 2.x', () => {
    const rows = buildServiceRows(mockDiscovery2x);

    expect(rows).toHaveLength(19);
    for (const row of rows) {
      expect(row).toMatchObject({
        title: null,
        requiredScopes: [],
        docsUrl: null,
      });
    }
    expect(rows.find((row) => row.name === 'login')).toEqual({
      id: 'API:login',
      kind: 'API',
      name: 'login',
      title: null,
      url: 'https://data.lsst.cloud/login',
      requiredScopes: [],
      docsUrl: null,
      openapiUrl: null,
    });
  });

  test('has no rows when discovery lists no services', () => {
    expect(buildServiceRows(getEmptyDiscovery())).toEqual([]);
  });
});

describe('filterServiceRows', () => {
  const rows = buildServiceRows(mockDiscoveryDataDev);

  test('keeps every row for a blank query', () => {
    expect(filterServiceRows(rows, '')).toBe(rows);
    expect(filterServiceRows(rows, '   ')).toBe(rows);
  });

  test('matches part of a service name, ignoring case', () => {
    expect(filterServiceRows(rows, 'NUBLADO').map((row) => row.id)).toEqual([
      'UI:nublado',
      'API:nublado-controller',
    ]);
  });

  test('matches part of a service title', () => {
    expect(filterServiceRows(rows, 'user').map((row) => row.name)).toEqual([
      'logout',
      'settings',
      'login',
    ]);
  });

  test('ignores surrounding whitespace in the query', () => {
    expect(filterServiceRows(rows, '  portal  ').map((row) => row.id)).toEqual([
      'UI:portal',
    ]);
  });

  test('keeps no rows when nothing matches', () => {
    expect(filterServiceRows(rows, 'no-such-service')).toEqual([]);
  });
});

describe('buildDatasetRows', () => {
  /** The data-dev row for the named dataset. */
  function dataDevRow(name: string) {
    const row = buildDatasetRows(mockDiscoveryDataDev).find(
      (candidate) => candidate.name === name
    );
    if (!row) throw new Error(`No ${name} row`);
    return row;
  }

  test('has one row per dataset, in discovery order', () => {
    expect(
      buildDatasetRows(mockDiscoveryDataDev).map((row) => row.name)
    ).toEqual(['dp1', 'dp2', 'dp02', 'dp03', 'prompt']);
  });

  test('links the docs, Butler config, and ObsCore config of dp1', () => {
    expect(dataDevRow('dp1')).toEqual({
      name: 'dp1',
      description: expect.stringMatching(/^Data Preview 1 contains/),
      docsUrl: 'https://dp1.lsst.io/',
      butlerConfigUrl:
        'https://data-dev.lsst.cloud/api/butler/repo/dp1/butler.yaml',
      obscoreConfigUrl:
        'https://raw.githubusercontent.com/lsst-dm/dax_obscore/refs/heads/main/configs/dp1.yaml',
      services: ['cutout', 'datalink', 'gms', 'hips', 'sia', 'tap'],
    });
  });

  test('reports an absent Butler config as null', () => {
    expect(dataDevRow('dp2')).toMatchObject({
      docsUrl: 'https://dp2.lsst.io/',
      butlerConfigUrl: null,
      obscoreConfigUrl:
        'https://raw.githubusercontent.com/lsst-dm/dax_obscore/refs/heads/main/configs/edp2.yaml',
    });
  });

  test('reports absent Butler and ObsCore configs as null', () => {
    expect(dataDevRow('dp03')).toMatchObject({
      docsUrl: 'https://dp0-3.lsst.io/',
      butlerConfigUrl: null,
      obscoreConfigUrl: null,
      services: ['gms', 'tap'],
    });
  });

  test('reports an absent docs URL as null', () => {
    expect(dataDevRow('prompt')).toEqual({
      name: 'prompt',
      description: 'Prompt products.',
      docsUrl: null,
      butlerConfigUrl: null,
      obscoreConfigUrl:
        'https://raw.githubusercontent.com/lsst-dm/dax_obscore/refs/heads/main/configs/prompt.yaml',
      services: ['alerts', 'gms', 'tap'],
    });
  });

  test('reports a missing or blank description as null', () => {
    const rows = buildDatasetRows({
      ...getEmptyDiscovery(),
      datasets: {
        missing: { services: {} },
        blank: { description: '  ', services: {} },
      },
    });

    expect(rows.map((row) => row.description)).toEqual([null, null]);
  });

  test('has no services for a dataset that exposes none', () => {
    const [row] = buildDatasetRows({
      ...getEmptyDiscovery(),
      datasets: { bare: { services: {} } },
    });

    expect(row).toEqual({
      name: 'bare',
      description: null,
      docsUrl: null,
      butlerConfigUrl: null,
      obscoreConfigUrl: null,
      services: [],
    });
  });

  test('has no ObsCore config under Repertoire 2.x', () => {
    const rows = buildDatasetRows(mockDiscovery2x);

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.obscoreConfigUrl)).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  test('has no rows when discovery lists no datasets', () => {
    expect(buildDatasetRows(getEmptyDiscovery())).toEqual([]);
  });
});

describe('buildInfluxRows', () => {
  /** A minimal InfluxDB database entry named for `database`. */
  function influxDatabase(
    database: string,
    extra: Partial<ServiceDiscovery['influxdb_databases'][string]> = {}
  ): ServiceDiscovery['influxdb_databases'][string] {
    return {
      url: 'https://example.org/influxdb/',
      database,
      schema_registry: 'http://schema-registry.example:8081/',
      credentials_url: `https://example.org/repertoire/discovery/influxdb/${database}`,
      local: false,
      ...extra,
    };
  }

  test('describes the local data-dev EFD database', () => {
    expect(buildInfluxRows(mockDiscoveryDataDev)).toEqual([
      {
        name: 'idfdev_efd',
        database: 'efd',
        url: 'https://data-dev.lsst.cloud/influxdb/',
        local: true,
        schemaRegistryUrl: 'http://sasquatch-schema-registry.sasquatch:8081/',
        credentialsUrl:
          'https://data-dev.lsst.cloud/repertoire/discovery/influxdb/idfdev_efd',
      },
    ]);
  });

  test('has one row per database, in discovery order', () => {
    const rows = buildInfluxRows({
      ...getEmptyDiscovery(),
      influxdb_databases: {
        summit_efd: influxDatabase('efd'),
        idfdev_lsst_prompt: influxDatabase('lsst.prompt', { local: true }),
      },
    });

    expect(rows.map(({ name, database }) => ({ name, database }))).toEqual([
      { name: 'summit_efd', database: 'efd' },
      { name: 'idfdev_lsst_prompt', database: 'lsst.prompt' },
    ]);
  });

  test('flags a database that is not local to the environment', () => {
    const [row] = buildInfluxRows({
      ...getEmptyDiscovery(),
      influxdb_databases: { summit_efd: influxDatabase('efd') },
    });

    expect(row.local).toBe(false);
  });

  test('has no rows when discovery lists no InfluxDB databases', () => {
    expect(buildInfluxRows(getEmptyDiscovery())).toEqual([]);
    expect(buildInfluxRows(mockDiscovery2x)).toEqual([]);
  });
});
