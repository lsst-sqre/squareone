import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import {
  buildApplicationRows,
  filterApplicationRows,
  getDiscoveryEndpointUrl,
  getEnvironmentSummary,
  getOperatorLinks,
  isEmptyDiscovery,
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
    const links = getOperatorLinks(mockDiscoveryDataDev, REPERTOIRE_URL);

    expect(links.map((link) => link.id)).toEqual([
      'argocd',
      'chronograf',
      'kafdrop',
      'environment-docs',
      'discovery',
    ]);
  });

  test('labels a service by its discovery title and links its docs', () => {
    const [argocd] = getOperatorLinks(mockDiscoveryDataDev, REPERTOIRE_URL);

    expect(argocd).toEqual({
      id: 'argocd',
      label: 'Argo CD',
      description: expect.any(String),
      url: 'https://data-dev.lsst.cloud/argo-cd',
      docsUrl: 'https://argo-cd.readthedocs.io/en/stable/',
    });
  });

  test('has no docs link for a service without a docs_url', () => {
    const chronograf = getOperatorLinks(
      mockDiscoveryDataDev,
      REPERTOIRE_URL
    ).find((link) => link.id === 'chronograf');

    expect(chronograf).toMatchObject({
      label: 'Chronograf metrics viewer',
      url: 'https://data-dev.lsst.cloud/chronograf',
      docsUrl: null,
    });
  });

  test('falls back to a fixed name for a service without a title', () => {
    const links = getOperatorLinks(mockDiscovery2x, REPERTOIRE_URL);

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
        withoutUiServices(mockDiscoveryDataDev, service),
        REPERTOIRE_URL
      );

      const ids = links.map((link) => link.id);
      expect(ids).not.toContain(service);
      expect(ids).toHaveLength(4);
    }
  );

  test('links the environment docs from environment.docs_url', () => {
    const docs = getOperatorLinks(mockDiscoveryDataDev, REPERTOIRE_URL).find(
      (link) => link.id === 'environment-docs'
    );

    expect(docs?.url).toBe('https://phalanx.lsst.io/environments/idfdev/');
  });

  test('omits the environment docs link when discovery has no environment', () => {
    const ids = getOperatorLinks(mockDiscovery2x, REPERTOIRE_URL).map(
      (link) => link.id
    );

    expect(ids).not.toContain('environment-docs');
  });

  test('links the raw discovery endpoint even with no operator services', () => {
    const links = getOperatorLinks(
      withoutUiServices(mockDiscovery2x, 'argocd', 'chronograf', 'kafdrop'),
      REPERTOIRE_URL
    );

    expect(links).toEqual([
      expect.objectContaining({
        id: 'discovery',
        url: 'https://data-dev.lsst.cloud/repertoire/discovery',
        docsUrl: null,
      }),
    ]);
  });
});

describe('buildApplicationRows', () => {
  /** The data-dev row for the named application. */
  function dataDevRow(name: string) {
    const row = buildApplicationRows(mockDiscoveryDataDev).find(
      (candidate) => candidate.name === name
    );
    if (!row) throw new Error(`No ${name} row`);
    return row;
  }

  test('has one row per application, in discovery order', () => {
    const rows = buildApplicationRows(mockDiscoveryDataDev);

    expect(rows).toHaveLength(41);
    expect(rows.map((row) => row.name)).toEqual(
      mockDiscoveryDataDev.applications
    );
  });

  test('joins an application to the UI service of the same name', () => {
    expect(dataDevRow('argocd')).toEqual({
      name: 'argocd',
      title: 'Argo CD',
      kind: 'UI',
      urls: [
        {
          kind: 'UI',
          service: 'argocd',
          url: 'https://data-dev.lsst.cloud/argo-cd',
        },
      ],
      docsUrl: 'https://argo-cd.readthedocs.io/en/stable/',
      requiredScopes: [],
      openapiUrl: null,
    });
  });

  test('joins an application to the internal service of the same name', () => {
    expect(dataDevRow('times-square')).toEqual({
      name: 'times-square',
      title: null,
      kind: 'API',
      urls: [
        {
          kind: 'API',
          service: 'times-square',
          url: 'https://data-dev.lsst.cloud/times-square/api',
        },
      ],
      docsUrl: 'https://times-square.lsst.io/',
      requiredScopes: ['exec:admin'],
      openapiUrl: 'https://data-dev.lsst.cloud/times-square/api/openapi.json',
    });
  });

  test('joins nublado to its UI service and the nublado-controller API', () => {
    expect(dataDevRow('nublado')).toEqual({
      name: 'nublado',
      title: 'Notebook aspect',
      kind: 'UI + API',
      urls: [
        {
          kind: 'UI',
          service: 'nublado',
          url: 'https://nb.data-dev.lsst.cloud/nb',
        },
        {
          kind: 'API',
          service: 'nublado-controller',
          url: 'https://data-dev.lsst.cloud/nublado',
        },
      ],
      docsUrl: 'https://nublado.lsst.io/',
      requiredScopes: ['exec:notebook', 'admin:jupyterlab'],
      openapiUrl: 'https://data-dev.lsst.cloud/nublado/openapi.json',
    });
  });

  test('joins datalinker to the datalink service, titled from it', () => {
    expect(dataDevRow('datalinker')).toMatchObject({
      title: 'DataLink',
      kind: 'API',
      urls: [
        {
          kind: 'API',
          service: 'datalink',
          url: 'https://data-dev.lsst.cloud/api/datalink',
        },
      ],
      requiredScopes: ['read:image'],
      openapiUrl: 'https://data-dev.lsst.cloud/api/datalink/openapi.json',
    });
  });

  test('joins vo-cutouts to the cutout service', () => {
    const [row] = buildApplicationRows(
      discoveryWith({
        applications: ['vo-cutouts'],
        internal: {
          cutout: internalService('https://example.org/api/cutout', {
            title: 'SODA image cutouts',
          }),
        },
      })
    );

    expect(row).toMatchObject({
      title: 'SODA image cutouts',
      kind: 'API',
      urls: [
        {
          kind: 'API',
          service: 'cutout',
          url: 'https://example.org/api/cutout',
        },
      ],
    });
  });

  test('prefers the service named for the application over an alias', () => {
    const [row] = buildApplicationRows(
      discoveryWith({
        applications: ['nublado'],
        internal: {
          'nublado-controller': internalService('https://example.org/alias'),
          nublado: internalService('https://example.org/exact'),
        },
      })
    );

    expect(row.urls).toEqual([
      { kind: 'API', service: 'nublado', url: 'https://example.org/exact' },
    ]);
  });

  test('does not join an application named for an Object property', () => {
    const [row] = buildApplicationRows(
      discoveryWith({ applications: ['constructor'] })
    );

    expect(row.kind).toBeNull();
  });

  test('renders an application with no matching service as its name only', () => {
    expect(dataDevRow('cert-manager')).toEqual({
      name: 'cert-manager',
      title: null,
      kind: null,
      urls: [],
      docsUrl: null,
      requiredScopes: [],
      openapiUrl: null,
    });
  });

  test('joins only the internal service when discovery has no UI services', () => {
    const discovery: ServiceDiscovery = {
      ...mockDiscoveryDataDev,
      services: { ...mockDiscoveryDataDev.services, ui: {} },
    };
    const nublado = buildApplicationRows(discovery).find(
      (row) => row.name === 'nublado'
    );

    expect(nublado).toMatchObject({
      title: null,
      kind: 'API',
      docsUrl: null,
      requiredScopes: ['admin:jupyterlab'],
    });
  });

  test('joins only the UI service when discovery has no internal services', () => {
    const discovery: ServiceDiscovery = {
      ...mockDiscoveryDataDev,
      services: { ...mockDiscoveryDataDev.services, internal: {} },
    };
    const rows = buildApplicationRows(discovery);

    expect(rows.find((row) => row.name === 'nublado')).toMatchObject({
      kind: 'UI',
      openapiUrl: null,
      requiredScopes: ['exec:notebook'],
    });
    expect(rows.find((row) => row.name === 'times-square')?.kind).toBeNull();
  });

  test('takes the docs link from the API service when the UI has none', () => {
    const [row] = buildApplicationRows(
      discoveryWith({
        applications: ['app'],
        ui: { app: { url: 'https://example.org/app', required_scopes: [] } },
        internal: {
          app: internalService('https://example.org/api/app', {
            docs_url: 'https://app.lsst.io/',
          }),
        },
      })
    );

    expect(row.docsUrl).toBe('https://app.lsst.io/');
  });

  test('lists each scope the UI and API services require once', () => {
    const [row] = buildApplicationRows(
      discoveryWith({
        applications: ['app'],
        ui: {
          app: {
            url: 'https://example.org/app',
            required_scopes: ['exec:notebook', 'read:tap'],
          },
        },
        internal: {
          app: internalService('https://example.org/api/app', {
            required_scopes: ['read:tap', 'exec:admin'],
          }),
        },
      })
    );

    expect(row.requiredScopes).toEqual([
      'exec:notebook',
      'read:tap',
      'exec:admin',
    ]);
  });

  test('has no rows when discovery lists no applications', () => {
    expect(buildApplicationRows(getEmptyDiscovery())).toEqual([]);
  });
});

describe('filterApplicationRows', () => {
  const rows = buildApplicationRows(mockDiscoveryDataDev);

  test('keeps every row for a blank query', () => {
    expect(filterApplicationRows(rows, '')).toBe(rows);
    expect(filterApplicationRows(rows, '   ')).toBe(rows);
  });

  test('matches part of an application name, ignoring case', () => {
    expect(
      filterApplicationRows(rows, 'STRIMZI').map((row) => row.name)
    ).toEqual([
      'strimzi',
      'strimzi-access-operator',
      'strimzi-registry-operator',
    ]);
  });

  test('matches part of an application title', () => {
    expect(
      filterApplicationRows(rows, 'notebook aspect').map((row) => row.name)
    ).toEqual(['nublado']);
  });

  test('keeps no rows when nothing matches', () => {
    expect(filterApplicationRows(rows, 'no-such-app')).toEqual([]);
  });
});
