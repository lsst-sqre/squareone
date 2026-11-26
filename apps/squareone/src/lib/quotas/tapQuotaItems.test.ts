import { describe, expect, test } from 'vitest';

import {
  buildConcurrentQueryItems,
  buildDataScannedItems,
} from './tapQuotaItems';

describe('buildConcurrentQueryItems', () => {
  test('shows a TAP service with its concurrent query limit', () => {
    const items = buildConcurrentQueryItems({ qserv: { concurrent: 5 } });

    expect(items).toEqual([{ key: 'qserv', value: '5 concurrent queries' }]);
  });

  test('uses the singular for a limit of one query', () => {
    const items = buildConcurrentQueryItems({ ssotap: { concurrent: 1 } });

    expect(items).toEqual([{ key: 'ssotap', value: '1 concurrent query' }]);
  });

  test('sorts rows by service name', () => {
    const items = buildConcurrentQueryItems({
      ssotap: { concurrent: 2 },
      'tap-dev': { concurrent: 3 },
      qserv: { concurrent: 5 },
    });

    expect(items.map(({ key }) => key)).toEqual(['qserv', 'ssotap', 'tap-dev']);
  });
});

describe('buildDataScannedItems', () => {
  test('shows a TAP service with its formatted bytes billed quota', () => {
    const items = buildDataScannedItems({
      qserv: { concurrent: 5, bytes_billed: 10737418240 },
    });

    expect(items).toEqual([{ key: 'qserv', value: '10 GiB' }]);
  });

  test('omits services whose bytes billed quota is null or absent', () => {
    const items = buildDataScannedItems({
      qserv: { concurrent: 5, bytes_billed: 10737418240 },
      ssotap: { concurrent: 2 },
      'tap-dev': { concurrent: 3, bytes_billed: null },
    });

    expect(items).toEqual([{ key: 'qserv', value: '10 GiB' }]);
  });

  test('shows a zero bytes billed quota as 0 bytes', () => {
    const items = buildDataScannedItems({
      qserv: { concurrent: 5, bytes_billed: 0 },
    });

    expect(items).toEqual([{ key: 'qserv', value: '0 bytes' }]);
  });

  test('sorts rows by service name', () => {
    const items = buildDataScannedItems({
      ssotap: { concurrent: 2, bytes_billed: 10485760 },
      'tap-dev': { concurrent: 3, bytes_billed: 500 },
      qserv: { concurrent: 5, bytes_billed: 1610612736 },
    });

    expect(items).toEqual([
      { key: 'qserv', value: '1.5 GiB' },
      { key: 'ssotap', value: '10 MiB' },
      { key: 'tap-dev', value: '500 bytes' },
    ]);
  });

  test('builds no rows when there are no TAP quotas', () => {
    expect(buildDataScannedItems({})).toEqual([]);
  });
});
