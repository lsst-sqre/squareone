import {
  getEmptyDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import { serviceDiscoveryToDatasetDocs } from './transform';

describe('serviceDiscoveryToDatasetDocs', () => {
  test('falls back to the raw key for a dataset without a display name', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: {
        dr1: {
          description: 'The first data release.',
          docs_url: 'https://dr1.lsst.io',
          services: {},
        },
      },
    } as ServiceDiscovery;

    expect(
      serviceDiscoveryToDatasetDocs(discovery, {
        services: {},
        datasetDisplayNames: {},
      })
    ).toEqual([
      {
        datasetKey: 'dr1',
        displayName: 'dr1',
        description: 'The first data release.',
        docsUrl: 'https://dr1.lsst.io',
      },
    ]);
  });

  test('uses the presentation map display name when one is curated', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: { dr1: { services: {} } },
    } as ServiceDiscovery;

    const [card] = serviceDiscoveryToDatasetDocs(discovery, {
      services: {},
      datasetDisplayNames: { dr1: 'Data Release 1' },
    });

    expect(card.displayName).toBe('Data Release 1');
  });

  test('yields null description and docs URL when discovery has neither', () => {
    // Both fields are optional (and nullable) in the discovery schema.
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: {
        dp1: { services: {} },
        dp02: { description: null, docs_url: null, services: {} },
      },
    } as ServiceDiscovery;

    expect(serviceDiscoveryToDatasetDocs(discovery)).toEqual([
      {
        datasetKey: 'dp1',
        displayName: 'Data Preview 1',
        description: null,
        docsUrl: null,
      },
      {
        datasetKey: 'dp02',
        displayName: 'Data Preview 0.2',
        description: null,
        docsUrl: null,
      },
    ]);
  });

  test('yields no cards for a discovery without datasets', () => {
    expect(serviceDiscoveryToDatasetDocs(getEmptyDiscovery())).toEqual([]);
  });
});
