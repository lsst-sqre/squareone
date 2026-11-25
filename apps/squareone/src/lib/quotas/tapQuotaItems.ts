/*
 * Rows of the TAP sections of the quotas page ("Concurrent queries" and
 * "Data scanned"), built from Gafaelfawr's per-TAP-service quotas
 * (`quota.tap`).
 *
 * Rows are keyed by the raw TAP service name (e.g. `qserv`). That name is a
 * free-form Gafaelfawr configuration string with no counterpart in Repertoire
 * service discovery, so it is not mapped to a service title.
 */

import type { Quota, TapQuota } from '@lsst-sqre/gafaelfawr-client';

import { formatBytes } from './formatBytes';

/** One TAP row of the quotas page. */
export type TapQuotaItem = {
  /** The TAP service name, exactly as Gafaelfawr reports it. */
  key: string;
  /** The limit, e.g. `"5 concurrent queries"` or `"10 GiB"`. */
  value: string;
};

/** The TAP quotas as `[service, quota]` entries, sorted by service name. */
function sortedTapEntries(tap: Quota['tap']): [string, TapQuota][] {
  return Object.entries(tap).sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Build the "Concurrent queries" rows from Gafaelfawr's `quota.tap`: one row
 * per TAP service, sorted by service name, valued
 * `"<N> concurrent query"` or `"<N> concurrent queries"`.
 *
 * @param tap - Gafaelfawr's TAP quotas, by TAP service name.
 */
export function buildConcurrentQueryItems(tap: Quota['tap']): TapQuotaItem[] {
  return sortedTapEntries(tap).map(([service, { concurrent }]) => ({
    key: service,
    value: `${concurrent} concurrent ${concurrent === 1 ? 'query' : 'queries'}`,
  }));
}

/**
 * Build the "Data scanned" rows from Gafaelfawr's `quota.tap`: one row per TAP
 * service that has a `bytes_billed` quota, sorted by service name, valued by
 * `formatBytes` (e.g. `"10 GiB"`; a quota of `0` is `"0 bytes"`).
 *
 * A service whose `bytes_billed` is `null` or absent has no such quota and
 * gets no row. The value carries no rate suffix: the section description
 * states the 24-hour window.
 *
 * @param tap - Gafaelfawr's TAP quotas, by TAP service name.
 */
export function buildDataScannedItems(tap: Quota['tap']): TapQuotaItem[] {
  return sortedTapEntries(tap).flatMap(([service, { bytes_billed }]) =>
    typeof bytes_billed === 'number'
      ? [{ key: service, value: formatBytes(bytes_billed) }]
      : []
  );
}
