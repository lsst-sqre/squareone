/*
 * Rows of the "Storage" section of the quotas page, built from Gafaelfawr's
 * per-mount disk quotas (`quota.disk`).
 */

import type { Quota } from '@lsst-sqre/gafaelfawr-client';

import { formatBytes } from './formatBytes';

/** One storage row of the quotas page. */
export type DiskQuotaItem = {
  /** The filesystem mount point, exactly as Gafaelfawr reports it. */
  key: string;
  /** The allocation in binary units, e.g. `"30 GiB"`. */
  value: string;
};

/**
 * Build the storage rows from Gafaelfawr's `quota.disk`: one row per mount
 * point, sorted by mount point, with the allocation formatted by
 * `formatBytes` (a quota of `0` is `"0 bytes"`).
 *
 * @param disk - Gafaelfawr's disk quotas: allocation in bytes by mount point.
 */
export function buildDiskQuotaItems(disk: Quota['disk']): DiskQuotaItem[] {
  return Object.entries(disk)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mountPoint, bytes]) => ({
      key: mountPoint,
      value: formatBytes(bytes),
    }));
}
