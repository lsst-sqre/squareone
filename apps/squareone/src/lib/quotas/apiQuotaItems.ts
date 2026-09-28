/*
 * Rows of the "Rate limits" section of the quotas page, built by joining
 * Gafaelfawr's API quotas (`quota.api`, keyed by quota label) to the quota
 * labels that Repertoire service discovery declares for each service.
 */

import type { Quota } from '@lsst-sqre/gafaelfawr-client';
import type { QuotaLabelIndex } from '@lsst-sqre/repertoire-client';

/** A link to the documentation of the service a quota applies to. */
export type ApiQuotaDocsLink = {
  /** URL of the service's documentation. */
  url: string;
  /**
   * Accessible name for the link, naming the service (e.g.
   * `"Table access protocol (TAP) documentation"`).
   */
  label: string;
};

/** One API rate-limit row of the quotas page. */
export type ApiQuotaItem = {
  /**
   * The row heading: `"<service title> — <label title>"` when discovery
   * describes the quota label, otherwise the raw quota label.
   */
  key: string;
  /** The limit, e.g. `"100 requests"`. */
  value: string;
  /** Documentation of the service the quota applies to, if it has any. */
  docs: ApiQuotaDocsLink | null;
};

/**
 * Build the API rate-limit rows from Gafaelfawr's `quota.api`.
 *
 * Each quota label is looked up in the quota label index from
 * `ServiceDiscoveryQuery.getQuotaLabelIndex()`. A described label is shown as
 * `"<service title> — <label title>"` with a link to the service's docs when
 * it has a `docs_url`; a label the index flags `internal` is dropped. A label
 * the index does not describe, or every label when there is no index
 * (discovery disabled, or Repertoire 2.x, which declares no quota labels), is
 * shown as-is.
 *
 * An empty title falls back to the raw identifier: the service name stands in
 * for a missing service title, and the quota label itself for an empty label
 * title (e.g. `"Table access protocol (TAP) — tap"`). The fallback keeps the
 * `" — <label title>"` suffix rather than dropping it, so untitled labels of
 * one service still get distinct headings.
 *
 * Label titles are otherwise rendered verbatim. Rows are sorted by their
 * rendered key.
 *
 * @param api - Gafaelfawr's API quotas: requests per minute by quota label.
 * @param quotaLabelIndex - Quota labels declared by service discovery.
 */
export function buildApiQuotaItems(
  api: Quota['api'],
  quotaLabelIndex?: QuotaLabelIndex
): ApiQuotaItem[] {
  const items: ApiQuotaItem[] = [];
  for (const [label, limit] of Object.entries(api)) {
    const entry = quotaLabelIndex?.[label];
    if (entry?.internal) continue;

    const value = `${limit} ${limit === 1 ? 'request' : 'requests'}`;
    if (!entry) {
      items.push({ key: label, value, docs: null });
      continue;
    }

    const serviceTitle = entry.serviceTitle || entry.serviceName;
    const labelTitle = entry.labelTitle || label;
    items.push({
      key: `${serviceTitle} — ${labelTitle}`,
      value,
      docs: entry.serviceDocsUrl
        ? {
            url: entry.serviceDocsUrl,
            label: `${serviceTitle} documentation`,
          }
        : null,
    });
  }
  return items.sort((a, b) => a.key.localeCompare(b.key));
}
