import {
  getEmptyDiscovery,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

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

  test('lists the full set of a dataset services, including unmapped ones', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);
    const dp1 = groups.find((group) => group.datasetKey === 'dp1');

    // Every service under dp1 is rendered, including the unmapped
    // datalink/gms services that later curated work falls back on.
    expect(dp1?.endpoints.map((endpoint) => endpoint.label)).toEqual([
      'cutout',
      'datalink',
      'gms',
      'hips',
      'sia',
      'tap',
    ]);
  });

  test('uses the raw service name as the label and the base url as the endpoint url', () => {
    const groups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);
    const dp1 = groups.find((group) => group.datasetKey === 'dp1');
    const tap = dp1?.endpoints.find((endpoint) => endpoint.label === 'tap');

    expect(tap).toEqual({
      label: 'tap',
      url: 'https://data.lsst.cloud/api/tap',
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

    expect(serviceDiscoveryToApiEndpointGroups(discovery)).toEqual([
      { datasetKey: 'dp1', endpoints: [] },
    ]);
  });

  test('tolerates a dataset missing its services field', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      // Intentionally omit `services` to exercise the defensive fallback.
      datasets: { dp1: {} },
    } as unknown as ServiceDiscovery;

    expect(serviceDiscoveryToApiEndpointGroups(discovery)).toEqual([
      { datasetKey: 'dp1', endpoints: [] },
    ]);
  });
});
