import { describe, expect, it } from 'vitest';
import { mockDiscovery } from './mock-discovery';
import { DiscoverySchema } from './schemas';
import { generateRandomDiscovery } from './test-utils';

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
