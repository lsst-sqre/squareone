import {
  getEmptyDiscovery,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import type { PresentationMap } from './presentation';
import { serviceDiscoveryToApiEndpointGroups } from './transform';

describe('serviceDiscoveryToApiEndpointGroups', () => {
  test('produces one group per dataset, in discovery order', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);

    expect(groups.map((group) => group.datasetKey)).toEqual([
      'dp1',
      'dp02',
      'dp03',
    ]);
  });

  test('resolves the curated dataset display name, docs url, and description', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);
    const dp1 = groups.find((group) => group.datasetKey === 'dp1');

    expect(dp1?.displayName).toBe('Data Preview 1');
    expect(dp1?.docsUrl).toBe('https://dp1.lsst.io');
    expect(dp1?.description).toContain('Data Preview 1 contains');
  });

  test('falls back to the raw dataset key for an unmapped dataset', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: { mystery: { services: {} } },
    } as ServiceDiscovery;

    const [group] = serviceDiscoveryToApiEndpointGroups(discovery);
    expect(group.displayName).toBe('mystery');
  });

  test('lists the full set of a dataset services, including unmapped ones', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);
    const dp1 = groups.find((group) => group.datasetKey === 'dp1');

    // Every service under dp1 is rendered, each with its curated label.
    expect(dp1?.endpoints.map((endpoint) => endpoint.label)).toEqual([
      'SODA Image Cutouts',
      'DataLink',
      'Group Membership Service (GMS)',
      'HiPS (Hierarchical Progressive Survey)',
      'Simple Image Access (SIA v2)',
      'Table Access Protocol (TAP)',
    ]);
  });

  test('applies curated labels, IVOA links, and selected URLs (matching idfprod)', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);
    const dp1 = groups.find((group) => group.datasetKey === 'dp1');
    const byLabel = (label: string) =>
      dp1?.endpoints.find((endpoint) => endpoint.label === label);

    // SIA surfaces the sia-query-2.0 /query URL and the IVOA SIA standard link.
    expect(byLabel('Simple Image Access (SIA v2)')).toEqual({
      label: 'Simple Image Access (SIA v2)',
      url: 'https://data.lsst.cloud/api/sia/dp1/query',
      ivoaUrl: 'https://www.ivoa.net/documents/SIA/',
    });
    // HiPS surfaces the hips-list-1.0 /list URL.
    expect(byLabel('HiPS (Hierarchical Progressive Survey)')?.url).toBe(
      'https://data.lsst.cloud/api/hips/v2/dp1/list'
    );
    // TAP uses the base URL.
    expect(byLabel('Table Access Protocol (TAP)')?.url).toBe(
      'https://data.lsst.cloud/api/tap'
    );
    // SODA Cutout uses the base URL.
    expect(byLabel('SODA Image Cutouts')?.url).toBe(
      'https://data.lsst.cloud/api/cutout'
    );
  });

  test('uses a single generic TAP label across datasets; the dataset gives context', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);
    const dp03 = groups.find((group) => group.datasetKey === 'dp03');
    const tap = dp03?.endpoints.find(
      (endpoint) => endpoint.label === 'Table Access Protocol (TAP)'
    );

    // dp03's tap is SSO TAP: same generic label, dataset-specific base URL.
    expect(tap?.url).toBe('https://data.lsst.cloud/api/ssotap');
  });

  test('services absent from the map fall back to raw name + base url, no IVOA link', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: {
        dp1: {
          services: {
            mystery: {
              url: 'https://data.lsst.cloud/api/mystery',
              versions: {},
            },
          },
        },
      },
    } as unknown as ServiceDiscovery;

    const [group] = serviceDiscoveryToApiEndpointGroups(discovery);
    expect(group.endpoints[0]).toEqual({
      label: 'mystery',
      url: 'https://data.lsst.cloud/api/mystery',
      ivoaUrl: null,
    });
  });

  test('falls back to the base url when a curated version key is missing', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: {
        dp1: {
          // sia is mapped to the sia-query-2.0 version, which is absent here.
          services: {
            sia: { url: 'https://example.org/api/sia/dp1', versions: {} },
          },
        },
      },
    } as unknown as ServiceDiscovery;

    const [group] = serviceDiscoveryToApiEndpointGroups(discovery);
    expect(group.endpoints[0]?.url).toBe('https://example.org/api/sia/dp1');
  });

  test('accepts an injected presentation map (pure function)', () => {
    const custom: PresentationMap = {
      services: { tap: { label: 'Custom TAP', url: 'base' } },
      datasetDisplayNames: { dp1: 'Custom DP1' },
    };
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: {
        dp1: {
          services: { tap: { url: 'https://example.org/tap', versions: {} } },
        },
      },
    } as unknown as ServiceDiscovery;

    const [group] = serviceDiscoveryToApiEndpointGroups(discovery, custom);
    expect(group.displayName).toBe('Custom DP1');
    expect(group.endpoints[0]).toEqual({
      label: 'Custom TAP',
      url: 'https://example.org/tap',
      ivoaUrl: null,
    });
  });

  test('returns an empty array when discovery has no datasets', () => {
    expect(serviceDiscoveryToApiEndpointGroups(getEmptyDiscovery())).toEqual(
      []
    );
  });

  test('returns a group with no endpoints when a dataset has no services', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: { dp1: { services: {} } },
    } as ServiceDiscovery;

    const [group] = serviceDiscoveryToApiEndpointGroups(discovery);
    expect(group.endpoints).toEqual([]);
  });

  test('tolerates a dataset missing its services field', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      // Intentionally omit `services` to exercise the defensive fallback.
      datasets: { dp1: {} },
    } as unknown as ServiceDiscovery;

    const [group] = serviceDiscoveryToApiEndpointGroups(discovery);
    expect(group.endpoints).toEqual([]);
  });
});
