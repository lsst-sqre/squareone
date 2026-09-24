import { classifyError, type ReportError } from '@lsst-sqre/api-client-core';
import {
  fetchServiceDiscovery,
  type Logger,
} from '@lsst-sqre/repertoire-client';

import { serviceDiscoveryToDatasetDocs } from './transform';
import type { DatasetDocsResult } from './types';

export type ResolveDatasetDocsOptions = {
  /** Configured Repertoire base URL, or undefined when discovery is not set. */
  repertoireUrl?: string;
  /** Optional server-side logger for recording fetch failures. */
  logger?: Logger;
  /** Optional error reporter (e.g. Sentry) for report-worthy failures. */
  reportError?: ReportError;
};

/**
 * Resolve the dataset documentation cards for the `/docs` page server-side.
 *
 * Mirrors `resolveApiEndpoints`:
 * - no `repertoireUrl` -> `omitted` (the page leaves the cards out);
 * - a fetch/parse failure -> `unavailable` (the page shows a brief notice) and
 *   the error is logged server-side; report-worthy failures (a Repertoire 5xx
 *   outage, contract drift, or a network failure) are additionally forwarded
 *   to `reportError`;
 * - success -> `ok` with one entry per dataset from
 *   {@link serviceDiscoveryToDatasetDocs}.
 *
 * Uses the repertoire-client's existing 5-minute in-process discovery cache.
 */
export async function resolveDatasetDocs({
  repertoireUrl,
  logger,
  reportError,
}: ResolveDatasetDocsOptions): Promise<DatasetDocsResult> {
  if (!repertoireUrl) {
    return { status: 'omitted' };
  }

  try {
    const discovery = await fetchServiceDiscovery(
      repertoireUrl,
      logger ? { logger } : undefined
    );
    return {
      status: 'ok',
      datasets: serviceDiscoveryToDatasetDocs(discovery),
    };
  } catch (error) {
    logger?.error(
      { err: error },
      'Failed to fetch service discovery for the /docs dataset cards'
    );
    if (
      reportError &&
      classifyError(error, { isServer: true }) === 'report-worthy'
    ) {
      reportError(error, {
        site: 'docs-dataset-discovery',
        package: 'squareone',
      });
    }
    return { status: 'unavailable' };
  }
}
