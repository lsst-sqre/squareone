import { describe, expect, it } from 'vitest';
import discovery21 from './__fixtures__/discovery-2.1.0-data.json';
import discovery30 from './__fixtures__/discovery-3.0.0-data-dev.json';
import { mockDiscovery } from './mock-discovery';
import { DiscoverySchema } from './schemas';
import { generateRandomDiscovery } from './test-utils';

describe('DiscoverySchema (Repertoire 3.0.0, live data-dev)', () => {
  it('parses the environment metadata', () => {
    const data = DiscoverySchema.parse(discovery30);

    expect(data.environment).toEqual({
      name: 'data-dev.lsst.cloud',
      label: 'idfdev',
      title: 'SQuaRE RSP development',
      title_long: 'SQuaRE RSP development',
      description: expect.stringContaining('development environment'),
      docs_url: 'https://phalanx.lsst.io/environments/idfdev/',
    });
    // The deprecated field is still emitted alongside `environment`.
    expect(data.environment_name).toBe('data-dev.lsst.cloud');
  });

  it('parses UI service title, docs_url, and required_scopes', () => {
    const { ui } = DiscoverySchema.parse(discovery30).services;

    expect(ui.nublado).toEqual({
      url: 'https://nb.data-dev.lsst.cloud/nb',
      title: 'Notebook aspect',
      docs_url: 'https://nublado.lsst.io/',
      required_scopes: ['exec:notebook'],
    });
    expect(ui.portal.required_scopes).toEqual(['exec:portal']);
    // Services that declare no scopes default to an empty list.
    expect(ui.argocd.required_scopes).toEqual([]);
    expect(ui.chronograf.required_scopes).toEqual([]);
    expect(ui.comanage.url).toBe('https://id-dev.lsst.cloud/');
  });

  it('parses internal service metadata and quota labels', () => {
    const { internal } = DiscoverySchema.parse(discovery30).services;

    expect(internal.datalink.title).toBe('DataLink');
    expect(internal.datalink.required_scopes).toEqual(['read:image']);
    // `internal` defaults to false when the label omits it.
    expect(internal.muster.quota_labels).toEqual({
      'muster-quota': { title: 'Quota testing', internal: false },
    });
    expect(internal.gafaelfawr.docs_url).toBe('https://gafaelfawr.lsst.io/');
    // Services without quota labels default to an empty mapping.
    expect(internal.gafaelfawr.quota_labels).toEqual({});
  });

  it('parses data service metadata and dataset obscore_config', () => {
    const { datasets } = DiscoverySchema.parse(discovery30);

    expect(datasets.dp1.obscore_config).toBe(
      'https://raw.githubusercontent.com/lsst-dm/dax_obscore/refs/heads/main/configs/dp1.yaml'
    );
    const tap = datasets.dp1.services.tap;
    expect(tap.title).toBe('Table access protocol (TAP)');
    expect(tap.docs_url).toBe('https://www.ivoa.net/documents/TAP/');
    expect(tap.required_scopes).toEqual(['read:tap']);
    expect(tap.quota_labels).toEqual({
      tap: { title: 'TAP API calls', internal: false },
    });
    // GMS declares neither scopes nor quota labels.
    expect(datasets.dp1.services.gms.required_scopes).toEqual([]);
    expect(datasets.dp1.services.gms.quota_labels).toEqual({});
    // `prompt` has no docs_url on data-dev.
    expect(datasets.prompt.docs_url).toBeUndefined();
  });
});

describe('DiscoverySchema (Repertoire 2.1.0, live production)', () => {
  it('parses without the 3.0.0 fields, applying their defaults', () => {
    const result = DiscoverySchema.safeParse(discovery21);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const data = result.data;

    expect(data.environment).toBeUndefined();
    expect(data.environment_name).toBe('data.lsst.cloud');

    const portal = data.services.ui.portal;
    expect(portal.title).toBeUndefined();
    expect(portal.docs_url).toBeUndefined();
    expect(portal.required_scopes).toEqual([]);

    const gafaelfawr = data.services.internal.gafaelfawr;
    expect(gafaelfawr.required_scopes).toEqual([]);
    expect(gafaelfawr.quota_labels).toEqual({});

    const tap = data.datasets.dp1.services.tap;
    expect(tap.required_scopes).toEqual([]);
    expect(tap.quota_labels).toEqual({});
    expect(data.datasets.dp1.obscore_config).toBeUndefined();
  });
});

describe('DiscoverySchema', () => {
  it('validates mockDiscovery data', () => {
    const result = DiscoverySchema.safeParse(mockDiscovery);
    expect(result.success).toBe(true);
  });

  it('parses minimal discovery response', () => {
    const minimal = {
      services: {
        internal: {},
        ui: {},
      },
    };
    const result = DiscoverySchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.applications).toEqual([]);
      expect(result.data.datasets).toEqual({});
      expect(result.data.influxdb_databases).toEqual({});
    }
  });

  it('rejects invalid URL in services', () => {
    const invalid = {
      services: {
        internal: {
          gafaelfawr: {
            url: 'not-a-valid-url',
          },
        },
        ui: {},
      },
    };
    const result = DiscoverySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates full discovery response', () => {
    const fullResponse = {
      applications: ['portal', 'nublado'],
      datasets: {
        dp1: {
          description: 'Data Preview 1',
          docs_url: 'https://example.com/docs',
          butler_config: null,
          services: {
            tap: {
              url: 'https://example.com/api/tap',
              openapi: null,
              versions: {},
            },
          },
        },
      },
      services: {
        internal: {
          gafaelfawr: {
            url: 'https://example.com/auth',
            openapi: 'https://example.com/auth/openapi.json',
            versions: {},
          },
        },
        ui: {
          portal: {
            url: 'https://example.com/portal',
          },
        },
      },
      influxdb_databases: {
        efd: {
          url: 'https://example.com/influxdb',
          database: 'efd',
          schema_registry: 'https://example.com/schema-registry',
          credentials_url: 'https://example.com/discovery/influxdb/efd',
        },
      },
    };
    const result = DiscoverySchema.safeParse(fullResponse);
    expect(result.success).toBe(true);
  });

  it('accepts the 2.0.0 environment_name field', () => {
    const result = DiscoverySchema.safeParse({
      environment_name: 'data.lsst.cloud',
      services: { internal: {}, ui: {} },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.environment_name).toBe('data.lsst.cloud');
    }
  });

  it('accepts the 2.0.0 InfluxDB local flag and defaults it to false', () => {
    const result = DiscoverySchema.safeParse({
      services: { internal: {}, ui: {} },
      influxdb_databases: {
        local_metrics: {
          url: 'https://data.lsst.cloud/influxdb/',
          database: 'lsst.square.metrics',
          schema_registry: 'http://schema-registry:8081/',
          credentials_url:
            'https://data.lsst.cloud/repertoire/discovery/influxdb/local_metrics',
          local: true,
        },
        remote_efd: {
          url: 'https://data.lsst.cloud/influxdb/',
          database: 'efd',
          schema_registry: 'http://schema-registry:8081/',
          credentials_url:
            'https://data.lsst.cloud/repertoire/discovery/influxdb/remote_efd',
        },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.influxdb_databases.local_metrics.local).toBe(true);
      // Omitted (exclude_defaults) -> defaults to false
      expect(result.data.influxdb_databases.remote_efd.local).toBe(false);
    }
  });

  it('validates randomly generated discovery data', () => {
    // Test with multiple seeds for broader coverage
    const seeds = [1, 42, 123, 999];
    for (const seed of seeds) {
      const randomData = generateRandomDiscovery(seed);
      const result = DiscoverySchema.safeParse(randomData);
      expect(result.success).toBe(true);
    }
  });
});
