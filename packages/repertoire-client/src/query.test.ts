import { describe, expect, it } from 'vitest';
import discovery21 from './__fixtures__/discovery-2.1.0-data.json';
import discovery30 from './__fixtures__/discovery-3.0.0-data-dev.json';
import { getEmptyDiscovery } from './client';
import { mockDiscovery } from './mock-discovery';
import {
  createDiscoveryQuery,
  type DatasetWithService,
  ServiceDiscoveryQuery,
} from './query';
import { DiscoverySchema } from './schemas';
import type { ServiceDiscovery } from './types';

/** Query over the live Repertoire 3.0.0 data-dev discovery fixture. */
function dataDevQuery(): ServiceDiscoveryQuery {
  return createDiscoveryQuery(DiscoverySchema.parse(discovery30));
}

/** Query over the live Repertoire 2.1.0 production discovery fixture. */
function productionQuery(): ServiceDiscoveryQuery {
  return createDiscoveryQuery(DiscoverySchema.parse(discovery21));
}

describe('ServiceDiscoveryQuery', () => {
  describe('application queries', () => {
    it('hasApplication returns true for existing applications', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasApplication('portal')).toBe(true);
      expect(query.hasApplication('nublado')).toBe(true);
      expect(query.hasApplication('times-square')).toBe(true);
    });

    it('hasApplication returns false for non-existent applications', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasApplication('nonexistent')).toBe(false);
      expect(query.hasApplication('')).toBe(false);
    });

    it('getApplications returns all applications', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const apps = query.getApplications();

      expect(apps).toContain('portal');
      expect(apps).toContain('nublado');
      expect(apps).toContain('times-square');
      expect(apps).toHaveLength(mockDiscovery.applications.length);
    });

    it('getApplications returns empty array for empty discovery', () => {
      const query = createDiscoveryQuery(getEmptyDiscovery());

      expect(query.getApplications()).toEqual([]);
    });
  });

  describe('UI service queries', () => {
    it('getUiServiceUrl returns URL for existing UI service', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getUiServiceUrl('portal')).toBe(
        'https://data.lsst.cloud/portal/app'
      );
      expect(query.getUiServiceUrl('nublado')).toBe(
        'https://data.lsst.cloud/nb'
      );
    });

    it('getUiServiceUrl returns undefined for non-existent service', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getUiServiceUrl('nonexistent')).toBeUndefined();
    });

    it('hasUiService returns true for existing UI services', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasUiService('portal')).toBe(true);
      expect(query.hasUiService('nublado')).toBe(true);
    });

    it('getUiService returns full UI service info', () => {
      const portal = dataDevQuery().getUiService('portal');

      expect(portal).toEqual({
        url: 'https://data-dev.lsst.cloud/portal/app/',
        title: 'Portal aspect',
        required_scopes: ['exec:portal'],
      });
    });

    it('getUiService returns undefined for non-existent service', () => {
      const query = dataDevQuery();

      expect(query.getUiService('nonexistent')).toBeUndefined();
      // Times Square is only an internal service, never a UI service.
      expect(query.getUiService('times-square')).toBeUndefined();
    });

    it('hasUiService returns false for non-existent services', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasUiService('nonexistent')).toBe(false);
      // Internal services should not be found in UI
      expect(query.hasUiService('gafaelfawr')).toBe(false);
    });
  });

  describe('internal service queries', () => {
    it('getInternalServiceUrl returns URL for existing internal service', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getInternalServiceUrl('gafaelfawr')).toBe(
        'https://data.lsst.cloud/auth'
      );
      expect(query.getInternalServiceUrl('semaphore')).toBe(
        'https://data.lsst.cloud/semaphore'
      );
    });

    it('getInternalServiceUrl returns undefined for non-existent service', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getInternalServiceUrl('nonexistent')).toBeUndefined();
    });

    it('getInternalService returns full service info', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const gafaelfawr = query.getInternalService('gafaelfawr');

      expect(gafaelfawr).toBeDefined();
      expect(gafaelfawr?.url).toBe('https://data.lsst.cloud/auth');
      expect(gafaelfawr?.openapi).toBe(
        'https://data.lsst.cloud/auth/openapi.json'
      );
    });

    it('getInternalService returns undefined for non-existent service', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getInternalService('nonexistent')).toBeUndefined();
    });

    it('hasInternalService returns true for existing services', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasInternalService('gafaelfawr')).toBe(true);
      expect(query.hasInternalService('semaphore')).toBe(true);
    });

    it('hasInternalService returns false for non-existent services', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasInternalService('nonexistent')).toBe(false);
      // UI services should not be found in internal
      expect(query.hasInternalService('portal')).toBe(false);
    });
  });

  describe('dataset queries', () => {
    it('getDatasets returns all datasets', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const datasets = query.getDatasets();

      expect(Object.keys(datasets)).toContain('dp1');
      expect(Object.keys(datasets)).toContain('dp02');
      expect(Object.keys(datasets)).toContain('dp03');
    });

    it('getDataset returns specific dataset', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const dp02 = query.getDataset('dp02');

      expect(dp02).toBeDefined();
      expect(dp02?.description).toContain('Data Preview 0.2');
      expect(dp02?.docs_url).toBe('https://dp0-2.lsst.io');
    });

    it('getDataset returns undefined for non-existent dataset', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getDataset('nonexistent')).toBeUndefined();
    });

    it('hasDataset returns true for existing datasets', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasDataset('dp1')).toBe(true);
      expect(query.hasDataset('dp02')).toBe(true);
      expect(query.hasDataset('dp03')).toBe(true);
    });

    it('hasDataset returns false for non-existent datasets', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasDataset('nonexistent')).toBe(false);
    });

    it('getDataService returns a dataset-specific data service', () => {
      const tap = dataDevQuery().getDataService('dp03', 'tap');

      expect(tap?.url).toBe('https://data-dev.lsst.cloud/api/ssotap');
      expect(tap?.required_scopes).toEqual(['read:tap']);
    });

    it('getDataService returns undefined for a missing dataset or service', () => {
      const query = dataDevQuery();

      expect(query.getDataService('nonexistent', 'tap')).toBeUndefined();
      // dp03 is catalog-only, so it has no SIA service.
      expect(query.getDataService('dp03', 'sia')).toBeUndefined();
    });

    it('getDatasetsWithService finds datasets with TAP service', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const tapDatasets = query.getDatasetsWithService('tap');

      // Every dataset (dp1, dp02, dp03, prompt) serves TAP.
      expect(tapDatasets).toHaveLength(4);
      expect(tapDatasets.map((d) => d.id)).toContain('dp1');
      expect(tapDatasets.map((d) => d.id)).toContain('dp02');
      expect(tapDatasets.map((d) => d.id)).toContain('dp03');
      expect(tapDatasets.map((d) => d.id)).toContain('prompt');

      const dp1 = tapDatasets.find((d) => d.id === 'dp1');
      expect(dp1?.serviceUrl).toBe('https://data.lsst.cloud/api/tap');
      // dp03 routes through the SSO TAP endpoint.
      const dp03 = tapDatasets.find((d) => d.id === 'dp03');
      expect(dp03?.serviceUrl).toBe('https://data.lsst.cloud/api/ssotap');
      // prompt routes through the PPDB TAP endpoint.
      const prompt = tapDatasets.find((d) => d.id === 'prompt');
      expect(prompt?.serviceUrl).toBe('https://data.lsst.cloud/api/ppdbtap');
    });

    it('getDatasetsWithService finds datasets with SIA service', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const siaDatasets = query.getDatasetsWithService('sia');

      // Only the image datasets (dp1, dp02) serve SIA.
      expect(siaDatasets).toHaveLength(2);
      expect(siaDatasets.map((d) => d.id).sort()).toEqual(['dp02', 'dp1']);
      const dp1 = siaDatasets.find((d) => d.id === 'dp1');
      expect(dp1?.serviceUrl).toBe('https://data.lsst.cloud/api/sia/dp1');
    });

    it('getDatasetsWithService returns empty array for non-existent service', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getDatasetsWithService('nonexistent')).toEqual([]);
    });

    it('getDatasetsWithService returns correct type', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const result = query.getDatasetsWithService('tap');

      // TypeScript type check - each result should have id, dataset, serviceUrl
      result.forEach((item: DatasetWithService) => {
        expect(typeof item.id).toBe('string');
        expect(item.dataset).toBeDefined();
        expect(typeof item.serviceUrl).toBe('string');
      });
    });
  });

  describe('InfluxDB queries', () => {
    it('getInfluxDatabases returns all databases', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const databases = query.getInfluxDatabases();

      // mockDiscovery has empty influxdb_databases
      expect(databases).toEqual({});
    });

    it('getInfluxDatabase returns undefined for non-existent database', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getInfluxDatabase('nonexistent')).toBeUndefined();
    });

    it('works with InfluxDB databases when present', () => {
      const discoveryWithInflux: ServiceDiscovery = {
        ...mockDiscovery,
        influxdb_databases: {
          efd: {
            url: 'https://influxdb.lsst.cloud',
            database: 'efd',
            schema_registry: 'https://schema.lsst.cloud',
            credentials_url: 'https://creds.lsst.cloud/influx/efd',
            local: false,
          },
        },
      };

      const query = createDiscoveryQuery(discoveryWithInflux);

      expect(Object.keys(query.getInfluxDatabases())).toContain('efd');
      expect(query.getInfluxDatabase('efd')?.database).toBe('efd');
      expect(query.getInfluxDatabase('efd')?.url).toBe(
        'https://influxdb.lsst.cloud'
      );
    });
  });

  describe('convenience methods', () => {
    it('getSemaphoreUrl returns semaphore URL', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getSemaphoreUrl()).toBe('https://data.lsst.cloud/semaphore');
    });

    it('getGafaelfawrUrl returns gafaelfawr URL', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getGafaelfawrUrl()).toBe(
        'https://data.lsst.cloud/auth/api/v1'
      );
    });

    it('getPortalUrl returns portal URL', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getPortalUrl()).toBe('https://data.lsst.cloud/portal/app');
    });

    it('getNubladoUrl returns nublado URL', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getNubladoUrl()).toBe('https://data.lsst.cloud/nb');
    });

    it('getTimesSquareUrl returns times-square v1 API URL', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getTimesSquareUrl()).toBe(
        'https://data.lsst.cloud/times-square/api/v1'
      );
    });

    it('getSquareoneUrl returns the squareone UI service URL', () => {
      expect(dataDevQuery().getSquareoneUrl()).toBe(
        'https://data-dev.lsst.cloud/'
      );
    });

    it('getComanageUrl returns the comanage UI service URL', () => {
      expect(dataDevQuery().getComanageUrl()).toBe(
        'https://id-dev.lsst.cloud/'
      );
      // Production (2.1.0) has no COmanage registry.
      expect(productionQuery().getComanageUrl()).toBeUndefined();
    });

    it('convenience methods return undefined for missing services', () => {
      const query = createDiscoveryQuery(getEmptyDiscovery());

      expect(query.getSemaphoreUrl()).toBeUndefined();
      expect(query.getGafaelfawrUrl()).toBeUndefined();
      expect(query.getPortalUrl()).toBeUndefined();
      expect(query.getNubladoUrl()).toBeUndefined();
      expect(query.getTimesSquareUrl()).toBeUndefined();
      expect(query.getSquareoneUrl()).toBeUndefined();
      expect(query.getComanageUrl()).toBeUndefined();
    });
  });

  describe('flexible availability checks', () => {
    describe('hasTimesSquare', () => {
      it('returns true with no options when in applications', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasTimesSquare()).toBe(true);
      });

      it('returns true with no options when in internal services only', () => {
        const discovery: ServiceDiscovery = {
          ...mockDiscovery,
          applications: [], // Remove from applications, but still in internal services
        };
        const query = createDiscoveryQuery(discovery);

        // times-square is in internal services, hasTimesSquare checks apps OR ui
        // With no apps, it falls back to checking ui services, which doesn't have times-square
        expect(query.hasTimesSquare()).toBe(false);
      });

      it('returns false with no options when not present anywhere', () => {
        const query = createDiscoveryQuery(getEmptyDiscovery());

        expect(query.hasTimesSquare()).toBe(false);
      });

      it('returns true with hasApi: true when in applications', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasTimesSquare({ hasApi: true })).toBe(true);
      });

      it('returns false with hasApi: true when not in applications', () => {
        const discovery: ServiceDiscovery = {
          ...mockDiscovery,
          applications: ['portal', 'nublado'], // times-square removed
        };
        const query = createDiscoveryQuery(discovery);

        expect(query.hasTimesSquare({ hasApi: true })).toBe(false);
      });

      it('returns false with hasUi: true (times-square is internal service, not UI)', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        // times-square is in internal services, not UI services
        expect(query.hasTimesSquare({ hasUi: true })).toBe(false);
      });

      it('returns false with both hasApi and hasUi (not in UI services)', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        // times-square is in applications but NOT in UI services
        expect(query.hasTimesSquare({ hasApi: true, hasUi: true })).toBe(false);
      });
    });

    describe('hasPortal', () => {
      it('returns true with no options when present', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasPortal()).toBe(true);
      });

      it('returns true with hasUi: true when in UI services', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasPortal({ hasUi: true })).toBe(true);
      });

      it('returns true with hasApi: true when in applications', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasPortal({ hasApi: true })).toBe(true);
      });
    });

    describe('hasNublado', () => {
      it('returns true with no options when present', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasNublado()).toBe(true);
      });

      it('returns true with hasUi: true when in UI services', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasNublado({ hasUi: true })).toBe(true);
      });

      it('returns true with hasApi: true when in applications', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasNublado({ hasApi: true })).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty discovery gracefully', () => {
      const query = createDiscoveryQuery(getEmptyDiscovery());

      expect(query.getApplications()).toEqual([]);
      expect(query.hasApplication('portal')).toBe(false);
      expect(query.getUiServiceUrl('portal')).toBeUndefined();
      expect(query.getInternalServiceUrl('gafaelfawr')).toBeUndefined();
      expect(query.getDatasets()).toEqual({});
      expect(query.getInfluxDatabases()).toEqual({});
    });

    it('is immutable - does not modify original discovery', () => {
      const original = { ...mockDiscovery };
      const query = createDiscoveryQuery(mockDiscovery);

      // Access data
      query.getApplications();
      query.getDatasets();
      query.getDatasetsWithService('tap');

      // Original should be unchanged
      expect(mockDiscovery).toEqual(original);
    });
  });

  describe('environment queries', () => {
    it('getEnvironment returns the Repertoire 3.0.0 environment object', () => {
      const environment = dataDevQuery().getEnvironment();

      expect(environment?.label).toBe('idfdev');
      expect(environment?.title).toBe('SQuaRE RSP development');
      expect(environment?.docs_url).toBe(
        'https://phalanx.lsst.io/environments/idfdev/'
      );
    });

    it('getEnvironment returns null when the environment is absent', () => {
      expect(productionQuery().getEnvironment()).toBeNull();
      expect(createDiscoveryQuery(getEmptyDiscovery()).getEnvironment()).toBe(
        null
      );
    });

    it('getEnvironmentName prefers environment.name over environment_name', () => {
      const discovery: ServiceDiscovery = {
        ...DiscoverySchema.parse(discovery30),
        environment_name: 'deprecated.example.org',
      };

      expect(createDiscoveryQuery(discovery).getEnvironmentName()).toBe(
        'data-dev.lsst.cloud'
      );
    });

    it('getEnvironmentName falls back to the deprecated environment_name', () => {
      expect(productionQuery().getEnvironmentName()).toBe('data.lsst.cloud');
    });

    it('getEnvironmentName returns null when neither field is present', () => {
      expect(
        createDiscoveryQuery(getEmptyDiscovery()).getEnvironmentName()
      ).toBeNull();
    });
  });

  describe('canAccessService', () => {
    const multiScopeService = {
      url: 'https://example.org/admin-tool',
      required_scopes: ['exec:admin', 'exec:internal-tools'],
    };

    it('grants access to anonymous users (undefined scopes)', () => {
      const query = dataDevQuery();
      const portal = query.getUiService('portal');
      if (!portal) throw new Error('portal missing from fixture');

      // Unknown scopes (anonymous or not yet loaded) keep today's behaviour.
      expect(query.canAccessService(portal)).toBe(true);
      expect(query.canAccessService(multiScopeService, undefined)).toBe(true);
    });

    it('grants access when the service requires no scopes', () => {
      const query = dataDevQuery();
      const argocd = query.getUiService('argocd');
      if (!argocd) throw new Error('argocd missing from fixture');

      expect(argocd.required_scopes).toEqual([]);
      expect(query.canAccessService(argocd, [])).toBe(true);
      expect(query.canAccessService(argocd, ['read:tap'])).toBe(true);
    });

    it('denies access when the user holds only some required scopes', () => {
      const query = dataDevQuery();

      expect(query.canAccessService(multiScopeService, ['exec:admin'])).toBe(
        false
      );
      expect(query.canAccessService(multiScopeService, [])).toBe(false);
    });

    it('grants access when the user holds every required scope', () => {
      const query = dataDevQuery();
      const nublado = query.getUiService('nublado');
      if (!nublado) throw new Error('nublado missing from fixture');

      expect(
        query.canAccessService(multiScopeService, [
          'exec:internal-tools',
          'read:tap',
          'exec:admin',
        ])
      ).toBe(true);
      expect(query.canAccessService(nublado, ['exec:notebook'])).toBe(true);
      expect(query.canAccessService(nublado, ['exec:portal'])).toBe(false);
    });
  });

  describe('getQuotaLabelIndex', () => {
    it('maps data service quota labels to their service and label titles', () => {
      const index = dataDevQuery().getQuotaLabelIndex();

      expect(index.tap).toEqual({
        serviceName: 'tap',
        serviceTitle: 'Table access protocol (TAP)',
        serviceDocsUrl: 'https://www.ivoa.net/documents/TAP/',
        labelTitle: 'TAP API calls',
        internal: false,
      });
      // Keyed by the quota label, not the service name.
      expect(index['vo-cutouts']?.serviceName).toBe('cutout');
      expect(index['vo-cutouts']?.labelTitle).toBe('SODA API calls');
      expect(index.herald?.serviceName).toBe('alerts');
    });

    it('includes internal service quota labels', () => {
      const index = dataDevQuery().getQuotaLabelIndex();

      // muster declares neither a title nor a docs URL.
      expect(index['muster-quota']).toEqual({
        serviceName: 'muster',
        serviceTitle: null,
        serviceDocsUrl: null,
        labelTitle: 'Quota testing',
        internal: false,
      });
    });

    it('indexes every quota label on data-dev exactly once', () => {
      const index = dataDevQuery().getQuotaLabelIndex();

      expect(Object.keys(index).sort()).toEqual([
        'datalinker',
        'herald',
        'hips',
        'muster-quota',
        'sia',
        'tap',
        'vo-cutouts',
      ]);
    });

    it('de-duplicates a label across datasets, first occurrence winning', () => {
      const discovery = DiscoverySchema.parse({
        services: { internal: {}, ui: {} },
        datasets: {
          dp1: {
            services: {
              tap: {
                url: 'https://example.org/api/tap',
                title: 'First TAP',
                quota_labels: { tap: { title: 'First title' } },
              },
            },
          },
          dp02: {
            services: {
              tap: {
                url: 'https://example.org/api/tap',
                title: 'Second TAP',
                quota_labels: { tap: { title: 'Second title' } },
              },
            },
          },
        },
      });

      const index = createDiscoveryQuery(discovery).getQuotaLabelIndex();

      expect(Object.keys(index)).toEqual(['tap']);
      expect(index.tap?.serviceTitle).toBe('First TAP');
      expect(index.tap?.labelTitle).toBe('First title');
    });

    it('prefers the user-facing data service over an internal service', () => {
      // On data-dev `datalinker` is declared by both the internal `datalink`
      // service (no docs URL) and each dataset's `datalink` data service.
      const index = dataDevQuery().getQuotaLabelIndex();

      expect(index.datalinker).toEqual({
        serviceName: 'datalink',
        serviceTitle: 'DataLink',
        serviceDocsUrl: 'https://www.ivoa.net/documents/DataLink/',
        labelTitle: 'DataLink {links} requests',
        internal: false,
      });
    });

    it('carries the internal flag through', () => {
      const discovery = DiscoverySchema.parse({
        services: {
          internal: {
            muster: {
              url: 'https://example.org/muster',
              quota_labels: {
                'muster-quota': { title: 'Quota testing', internal: true },
              },
            },
          },
          ui: {},
        },
      });

      const index = createDiscoveryQuery(discovery).getQuotaLabelIndex();

      expect(index['muster-quota']?.internal).toBe(true);
    });

    it('is empty for Repertoire 2.x discovery', () => {
      expect(productionQuery().getQuotaLabelIndex()).toEqual({});
      expect(
        createDiscoveryQuery(getEmptyDiscovery()).getQuotaLabelIndex()
      ).toEqual({});
    });
  });

  describe('createDiscoveryQuery factory', () => {
    it('creates a ServiceDiscoveryQuery instance', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query).toBeInstanceOf(ServiceDiscoveryQuery);
    });

    it('creates independent instances', () => {
      const query1 = createDiscoveryQuery(mockDiscovery);
      const query2 = createDiscoveryQuery(getEmptyDiscovery());

      expect(query1.hasApplication('portal')).toBe(true);
      expect(query2.hasApplication('portal')).toBe(false);
    });
  });
});
