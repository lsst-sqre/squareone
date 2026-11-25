import { describe, expect, test } from 'vitest';

import { buildDiskQuotaItems } from './diskQuotaItems';

describe('buildDiskQuotaItems', () => {
  test('shows a mount point with its formatted quota', () => {
    const items = buildDiskQuotaItems({ '/home': 32212254720 });

    expect(items).toEqual([{ key: '/home', value: '30 GiB' }]);
  });

  test('sorts rows by mount point', () => {
    const items = buildDiskQuotaItems({
      '/scratch': 1099511627776,
      '/home': 32212254720,
      '/project': 1610612736,
    });

    expect(items).toEqual([
      { key: '/home', value: '30 GiB' },
      { key: '/project', value: '1.5 GiB' },
      { key: '/scratch', value: '1 TiB' },
    ]);
  });

  test('shows a zero quota as 0 bytes', () => {
    const items = buildDiskQuotaItems({ '/home': 0 });

    expect(items).toEqual([{ key: '/home', value: '0 bytes' }]);
  });

  test('builds no rows when there are no disk quotas', () => {
    expect(buildDiskQuotaItems({})).toEqual([]);
  });
});
