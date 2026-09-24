import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import {
  presentationMap as defaultPresentationMap,
  isIvoaStandardUrl,
  ivoaNameFromLabel,
  orderDatasetKeys,
  type PresentationMap,
  selectServiceUrl,
} from './presentation';
import type { ApiEndpointGroup } from './types';

/**
 * Transform Repertoire service discovery into the `/api-aspect` listing,
 * applying the curated {@link PresentationMap}.
 *
 * Emits one {@link ApiEndpointGroup} per discovered dataset, ordered by
 * {@link orderDatasetKeys} (releases newest-first, `prompt` pinned second,
 * unrecognized datasets after in discovery order). Each group resolves the
 * dataset display name (falling back to the raw key) and carries the dataset
 * `docs_url` and `description`. Every service under a dataset is rendered:
 *
 * - Curated services win entirely: the curated label, IVOA standard link and
 *   name, and version-selected URL, ignoring any discovery `title`/`docs_url`.
 * - Services absent from the map use the base URL and are labelled by their
 *   discovery `title`, falling back to
 *   {@link PresentationMap.untitledServiceLabels} and then the raw service
 *   name (Repertoire 2.x publishes no titles). A discovery `docs_url` becomes
 *   the IVOA link (named via {@link ivoaNameFromLabel}) when it points at an
 *   IVOA standard, otherwise a plain `docsUrl`; without one, no docs link.
 * - Every endpoint, curated or not, carries the service's discovery
 *   `required_scopes` as `requiredScopes` (empty when discovery declares none,
 *   as under Repertoire 2.x).
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

  return orderDatasetKeys(Object.keys(datasets)).map((datasetKey) => {
    const dataset = datasets[datasetKey];
    return {
      datasetKey,
      displayName: presentation.datasetDisplayNames[datasetKey] ?? datasetKey,
      docsUrl: dataset.docs_url ?? null,
      description: dataset.description ?? null,
      endpoints: Object.entries(dataset.services ?? {}).map(
        ([serviceName, service]) => {
          // Absent from Repertoire 2.x discovery (and from hand-built test
          // fixtures), so default to no requirement.
          const requiredScopes = service.required_scopes ?? [];
          const curated = presentation.services[serviceName];
          if (!curated) {
            const label =
              service.title ??
              presentation.untitledServiceLabels?.[serviceName] ??
              serviceName;
            const docsUrl = service.docs_url ?? null;
            const isIvoa = docsUrl !== null && isIvoaStandardUrl(docsUrl);
            return {
              label,
              url: service.url,
              ivoaUrl: isIvoa ? docsUrl : null,
              ivoaName: isIvoa ? ivoaNameFromLabel(label) : null,
              docsUrl: isIvoa ? null : docsUrl,
              requiredScopes,
            };
          }
          return {
            label: curated.label,
            url: selectServiceUrl(service, curated.url),
            ivoaUrl: curated.ivoaUrl ?? null,
            ivoaName: curated.ivoaName ?? null,
            docsUrl: null,
            requiredScopes,
          };
        }
      ),
    };
  });
}

export type { ApiEndpoint, ApiEndpointGroup } from './types';
