import { classifyError, type ReportError } from '@lsst-sqre/api-client-core';
import {
  createDiscoveryQuery,
  fetchServiceDiscovery,
  type Logger,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';

import type { ServiceLinkResult } from './types';

export type ResolveServiceLinkOptions = {
  /** Name of the UI service in discovery's `services.ui` (e.g. `comanage`). */
  service: string;
  /** Configured Repertoire base URL, or undefined when discovery is not set. */
  repertoireUrl?: string;
  /** Optional server-side logger for recording failures. */
  logger?: Logger;
  /** Optional error reporter (e.g. Sentry) for report-worthy failures. */
  reportError?: ReportError;
};

/**
 * Resolve a `<ServiceLink>` MDX tag's UI service URL server-side.
 *
 * Mirrors `resolveApiEndpoints` and `resolveDatasetDocs`:
 * - no `repertoireUrl` -> `omitted`;
 * - a fetch/parse failure -> `unavailable`, and the error is logged
 *   server-side; report-worthy failures (a Repertoire 5xx outage, contract
 *   drift, or a network failure) are additionally forwarded to `reportError`;
 * - discovery lists no `services.ui.<service>` -> `missing`, logged as a
 *   warning (a content author named a service this environment doesn't have);
 * - success -> `ok` with the service's discovered `url`.
 *
 * Uses the repertoire-client's existing 5-minute in-process discovery cache,
 * so every link on a page shares one discovery fetch.
 */
export async function resolveServiceLink({
  service,
  repertoireUrl,
  logger,
  reportError,
}: ResolveServiceLinkOptions): Promise<ServiceLinkResult> {
  if (!repertoireUrl) {
    return { status: 'omitted' };
  }

  let discovery: ServiceDiscovery;
  try {
    discovery = await fetchServiceDiscovery(
      repertoireUrl,
      logger ? { logger } : undefined
    );
  } catch (error) {
    logger?.error(
      { err: error, service },
      'Failed to fetch service discovery for a <ServiceLink>'
    );
    if (
      reportError &&
      classifyError(error, { isServer: true }) === 'report-worthy'
    ) {
      reportError(error, {
        site: 'service-link-discovery',
        package: 'squareone',
        service,
      });
    }
    return { status: 'unavailable' };
  }

  const url = createDiscoveryQuery(discovery).getUiServiceUrl(service);
  if (!url) {
    logger?.warn(
      { service },
      'UI service for a <ServiceLink> is not in service discovery'
    );
    return { status: 'missing' };
  }
  return { status: 'ok', url };
}
