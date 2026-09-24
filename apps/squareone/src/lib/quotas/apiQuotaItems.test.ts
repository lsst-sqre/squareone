import {
  createDiscoveryQuery,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import { buildApiQuotaItems } from './apiQuotaItems';

// The quota label index as data-dev publishes it (Repertoire 3.0).
const index = createDiscoveryQuery(mockDiscovery).getQuotaLabelIndex();

describe('buildApiQuotaItems', () => {
  test('labels a quota with its service and label titles', () => {
    const items = buildApiQuotaItems({ tap: 100 }, index);

    expect(items).toEqual([
      {
        label: 'tap',
        key: 'Table access protocol (TAP) — TAP API calls',
        value: '100 requests',
        docsUrl: 'https://www.ivoa.net/documents/TAP/',
        docsLabel: 'Table access protocol (TAP) documentation',
      },
    ]);
  });

  test('renders raw labels, muster-quota included, without an index', () => {
    // Discovery disabled or Repertoire 2.x: nothing describes the labels.
    const items = buildApiQuotaItems({ 'muster-quota': 5, tap: 100 });

    expect(items).toEqual([
      {
        label: 'muster-quota',
        key: 'muster-quota',
        value: '5 requests',
        docsUrl: null,
        docsLabel: null,
      },
      {
        label: 'tap',
        key: 'tap',
        value: '100 requests',
        docsUrl: null,
        docsLabel: null,
      },
    ]);
  });

  test('renders the raw label when the index does not describe it', () => {
    const items = buildApiQuotaItems({ 'new-service': 10 }, index);

    expect(items.map((item) => item.key)).toEqual(['new-service']);
  });

  test('drops labels the index flags internal', () => {
    // data-dev does not (yet) flag muster's label internal; Phalanx will.
    const items = buildApiQuotaItems(
      { 'muster-quota': 5, tap: 100 },
      {
        ...index,
        'muster-quota': { ...index['muster-quota'], internal: true },
      }
    );

    expect(items.map((item) => item.label)).toEqual(['tap']);
  });

  test('uses the singular for a limit of one request', () => {
    const items = buildApiQuotaItems({ tap: 1 }, index);

    expect(items[0].value).toBe('1 request');
  });

  test('falls back to the service name for a service with no title', () => {
    // Muster declares neither a title nor a docs URL on data-dev.
    const items = buildApiQuotaItems({ 'muster-quota': 5 }, index);

    expect(items).toEqual([
      {
        label: 'muster-quota',
        key: 'muster — Quota testing',
        value: '5 requests',
        docsUrl: null,
        docsLabel: null,
      },
    ]);
  });

  test('labels every quota the index describes', () => {
    const items = buildApiQuotaItems(
      { tap: 100, sia: 20, 'muster-quota': 5 },
      index
    );

    expect(items.map(({ key, value }) => [key, value])).toEqual([
      ['muster — Quota testing', '5 requests'],
      ['Simple image access (SIA) — Image requests', '20 requests'],
      ['Table access protocol (TAP) — TAP API calls', '100 requests'],
    ]);
  });

  test('sorts rows by their rendered key', () => {
    // By raw label tap < vo-cutouts, but by title SODA < Table.
    const items = buildApiQuotaItems({ tap: 100, 'vo-cutouts': 10 }, index);

    expect(items.map((item) => item.key)).toEqual([
      'SODA image cutouts — SODA API calls',
      'Table access protocol (TAP) — TAP API calls',
    ]);
  });
});
