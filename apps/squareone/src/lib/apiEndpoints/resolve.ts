import { classifyError, type ReportError } from '@lsst-sqre/api-client-core';
import {
  fetchServiceDiscovery,
  type Logger,
} from '@lsst-sqre/repertoire-client';

import { serviceDiscoveryToApiEndpointGroups } from './transform';
import type { ApiEndpointsResult } from './types';

export type ResolveApiEndpointsOptions = {
  /** Configured Repertoire base URL, or undefined when discovery is not set. */
  repertoireUrl?: string;
  /** Optional server-side logger for recording fetch failures. */
  logger?: Logger;
  /**
   * Optional error reporter (e.g. Sentry) for report-worthy discovery failures.
   * When provided, a Repertoire outage or contract drift is forwarded so it is
   * distinguishable from an expected/quiet failure; the UI fallback is unchanged.
   */
  reportError?: ReportError;
};

/**
 * Resolve the API endpoint listing for the `/api-aspect` page server-side.
 *
 * Mirrors `HeaderNav`'s degrade-gracefully pattern:
 * - no `repertoireUrl` -> `omitted` (the page leaves the section out);
 * - a fetch/parse failure -> `unavailable` (the page shows a brief notice) and
 *   the error is logged server-side; report-worthy failures (a Repertoire 5xx
 *   outage or contract drift) are additionally forwarded to `reportError` so a
 *   real problem is distinguishable in Sentry from a quiet, expected failure;
 * - success -> `ok` with the dataset groups from the base transform.
 *
 * Uses the repertoire-client's existing 5-minute in-process discovery cache.
 */
export async function resolveApiEndpoints({
  repertoireUrl,
  logger,
  reportError,
}: ResolveApiEndpointsOptions): Promise<ApiEndpointsResult> {
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
      groups: serviceDiscoveryToApiEndpointGroups(discovery),
    };
  } catch (error) {
    logger?.error(
      { err: error },
      'Failed to fetch service discovery for /api-aspect'
    );
    // Runs during RSC rendering, so classify server-side: a Repertoire 5xx,
    // contract drift, or a network failure is report-worthy; auth/other 4xx
    // stays expected. The UI fallback ('unavailable') is unchanged either way.
    if (
      reportError &&
      classifyError(error, { isServer: true }) === 'report-worthy'
    ) {
      reportError(error, {
        site: 'api-aspect-discovery',
        package: 'squareone',
      });
    }
    return { status: 'unavailable' };
  }
}
