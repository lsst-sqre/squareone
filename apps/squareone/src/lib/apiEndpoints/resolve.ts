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
};

/**
 * Resolve the API endpoint listing for the `/api-aspect` page server-side.
 *
 * Mirrors `HeaderNav`'s degrade-gracefully pattern:
 * - no `repertoireUrl` -> `omitted` (the page leaves the section out);
 * - a fetch/parse failure -> `unavailable` (the page shows a brief notice) and
 *   the error is logged server-side;
 * - success -> `ok` with the dataset groups from the base transform.
 *
 * Uses the repertoire-client's existing 5-minute in-process discovery cache.
 */
export async function resolveApiEndpoints({
  repertoireUrl,
  logger,
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
    return { status: 'unavailable' };
  }
}
