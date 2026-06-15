import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import {
  presentationMap as defaultPresentationMap,
  type PresentationMap,
  selectServiceUrl,
} from './presentation';
import type { ApiEndpointGroup } from './types';

/**
 * Transform Repertoire service discovery into the `/api-aspect` listing,
 * applying the curated {@link PresentationMap}.
 *
 * Emits one {@link ApiEndpointGroup} per discovered dataset, in discovery
 * order. Each group resolves the dataset display name (falling back to the raw
 * key) and carries the dataset `docs_url` and `description`. Every service
 * under a dataset is rendered: mapped services get the curated label, IVOA
 * standard link, and version-selected URL; services absent from the map fall
 * back to the raw service name, the base URL, and a null IVOA link.
 *
 * Pure and parameterized by `presentation` (defaulting to the app's curated
 * map) so tests can inject their own mapping. Empty/missing fallbacks: a
 * discovery with no datasets yields `[]`, and a dataset with no (or a missing)
 * `services` map yields a group with no endpoints.
 */
export function serviceDiscoveryToApiEndpointGroups(
  discovery: ServiceDiscovery,
  presentation: PresentationMap = defaultPresentationMap
): ApiEndpointGroup[] {
  const datasets = discovery.datasets ?? {};

  return Object.entries(datasets).map(([datasetKey, dataset]) => ({
    datasetKey,
    displayName: presentation.datasetDisplayNames[datasetKey] ?? datasetKey,
    docsUrl: dataset.docs_url ?? null,
    description: dataset.description ?? null,
    endpoints: Object.entries(dataset.services ?? {}).map(
      ([serviceName, service]) => {
        const curated = presentation.services[serviceName];
        if (!curated) {
          return { label: serviceName, url: service.url, ivoaUrl: null };
        }
        return {
          label: curated.label,
          url: selectServiceUrl(service, curated.url),
          ivoaUrl: curated.ivoaUrl ?? null,
        };
      }
    ),
  }));
}

export type { ApiEndpoint, ApiEndpointGroup } from './types';
