import { describe, expect, it } from 'vitest';
import { getEmptyDiscovery } from './client';
import { mockDiscovery } from './mock-discovery';
import {
  createDiscoveryQuery,
  type DatasetWithService,
  ServiceDiscoveryQuery,
} from './query';
import type { ServiceDiscovery } from './types';

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
      expect(query.getUiServiceUrl('times-square')).toBe(
        'https://data.lsst.cloud/times-square'
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
      expect(query.hasUiService('times-square')).toBe(true);
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
        'https://data.lsst.cloud/auth/api/v1'
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
      expect(gafaelfawr?.url).toBe('https://data.lsst.cloud/auth/api/v1');
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

      expect(Object.keys(datasets)).toContain('dp0.2');
      expect(Object.keys(datasets)).toContain('dp1');
    });

    it('getDataset returns specific dataset', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const dp02 = query.getDataset('dp0.2');

      expect(dp02).toBeDefined();
      expect(dp02?.description).toBe('Data Preview 0.2');
      expect(dp02?.docs_url).toBe('https://dp0-2.lsst.io');
    });

    it('getDataset returns undefined for non-existent dataset', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getDataset('nonexistent')).toBeUndefined();
    });

    it('hasDataset returns true for existing datasets', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasDataset('dp0.2')).toBe(true);
      expect(query.hasDataset('dp1')).toBe(true);
    });

    it('hasDataset returns false for non-existent datasets', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.hasDataset('nonexistent')).toBe(false);
    });

    it('getDatasetsWithService finds datasets with TAP service', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const tapDatasets = query.getDatasetsWithService('tap');

      expect(tapDatasets).toHaveLength(2);
      expect(tapDatasets.map((d) => d.id)).toContain('dp0.2');
      expect(tapDatasets.map((d) => d.id)).toContain('dp1');

      const dp02 = tapDatasets.find((d) => d.id === 'dp0.2');
      expect(dp02?.serviceUrl).toBe('https://data.lsst.cloud/api/tap');
    });

    it('getDatasetsWithService finds datasets with SIA service', () => {
      const query = createDiscoveryQuery(mockDiscovery);
      const siaDatasets = query.getDatasetsWithService('sia');

      // Only dp0.2 has SIA service in mock data
      expect(siaDatasets).toHaveLength(1);
      expect(siaDatasets[0].id).toBe('dp0.2');
      expect(siaDatasets[0].serviceUrl).toBe('https://data.lsst.cloud/api/sia');
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

    it('getTimesSquareUrl returns times-square URL', () => {
      const query = createDiscoveryQuery(mockDiscovery);

      expect(query.getTimesSquareUrl()).toBe(
        'https://data.lsst.cloud/times-square'
      );
    });

    it('convenience methods return undefined for missing services', () => {
      const query = createDiscoveryQuery(getEmptyDiscovery());

      expect(query.getSemaphoreUrl()).toBeUndefined();
      expect(query.getGafaelfawrUrl()).toBeUndefined();
      expect(query.getPortalUrl()).toBeUndefined();
      expect(query.getNubladoUrl()).toBeUndefined();
      expect(query.getTimesSquareUrl()).toBeUndefined();
    });
  });

  describe('flexible availability checks', () => {
    describe('hasTimesSquare', () => {
      it('returns true with no options when in applications', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasTimesSquare()).toBe(true);
      });

      it('returns true with no options when in UI services only', () => {
        const discovery: ServiceDiscovery = {
          ...mockDiscovery,
          applications: [], // Remove from applications
        };
        const query = createDiscoveryQuery(discovery);

        expect(query.hasTimesSquare()).toBe(true);
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

      it('returns true with hasUi: true when in UI services', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasTimesSquare({ hasUi: true })).toBe(true);
      });

      it('returns false with hasUi: true when not in UI services', () => {
        const discovery: ServiceDiscovery = {
          ...mockDiscovery,
          services: {
            ...mockDiscovery.services,
            ui: {
              portal: mockDiscovery.services.ui.portal,
              nublado: mockDiscovery.services.ui.nublado,
              // times-square removed
            },
          },
        };
        const query = createDiscoveryQuery(discovery);

        expect(query.hasTimesSquare({ hasUi: true })).toBe(false);
      });

      it('returns true with both hasApi and hasUi when both present', () => {
        const query = createDiscoveryQuery(mockDiscovery);

        expect(query.hasTimesSquare({ hasApi: true, hasUi: true })).toBe(true);
      });

      it('returns false with both options when only in applications', () => {
        const discovery: ServiceDiscovery = {
          ...mockDiscovery,
          services: {
            ...mockDiscovery.services,
            ui: {
              portal: mockDiscovery.services.ui.portal,
              nublado: mockDiscovery.services.ui.nublado,
            },
          },
        };
        const query = createDiscoveryQuery(discovery);

        expect(query.hasTimesSquare({ hasApi: true, hasUi: true })).toBe(false);
      });

      it('returns false with both options when only in UI services', () => {
        const discovery: ServiceDiscovery = {
          ...mockDiscovery,
          applications: ['portal', 'nublado'],
        };
        const query = createDiscoveryQuery(discovery);

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
