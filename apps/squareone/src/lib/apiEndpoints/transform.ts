import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import type { ApiEndpointGroup } from './types';

/**
 * Transform Repertoire service discovery into the base `/api-aspect` listing.
 *
 * Emits one {@link ApiEndpointGroup} per discovered dataset, in discovery
 * order. Every service under a dataset is rendered — including unmapped
 * services such as `datalink` and `gms` — using the raw service name as the
 * label and the service's base `url` as the endpoint URL. Curated labels,
 * IVOA links, and version-selected URLs are layered on in later work (#465);
 * this base transform is purely structural.
 *
 * Empty/missing fallbacks: a discovery with no datasets yields `[]`, and a
 * dataset with no (or a missing) `services` map yields a group with no
 * endpoints.
 */
export function serviceDiscoveryToApiEndpointGroups(
  discovery: ServiceDiscovery
): ApiEndpointGroup[] {
  const datasets = discovery.datasets ?? {};

  return Object.entries(datasets).map(([datasetKey, dataset]) => ({
    datasetKey,
    endpoints: Object.entries(dataset.services ?? {}).map(
      ([serviceName, service]) => ({
        label: serviceName,
        url: service.url,
      })
    ),
  }));
}

export type { ApiEndpoint, ApiEndpointGroup } from './types';
