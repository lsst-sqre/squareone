import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import { getEnvironmentSummary, isEmptyDiscovery } from './overview';

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
