import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import { serviceDisplayName } from '../discovery/serviceDisplayName';
import {
  presentationMap as defaultPresentationMap,
  isIvoaStandardUrl,
  ivoaNameFromLabel,
  orderDatasetKeys,
  type PresentationMap,
  selectServiceUrl,
} from './presentation';
import type { ApiEndpointDocsLink, ApiEndpointGroup } from './types';

/** Docs link to an IVOA standard, labelled by the standard's short name. */
function ivoaDocsLink(url: string, name: string): ApiEndpointDocsLink {
  return { url, label: `IVOA ${name} docs` };
}

/**
 * Docs link for a service absent from the presentation map, from its
 * discovery `docs_url`: an IVOA standard is named via {@link
 * ivoaNameFromLabel}, any other docs page by the endpoint label. A missing or
 * empty `docs_url` yields no link.
 */
function discoveryDocsLink(
  docsUrl: string | null | undefined,
  label: string
): ApiEndpointDocsLink | null {
  if (!docsUrl) {
    return null;
  }
  if (isIvoaStandardUrl(docsUrl)) {
    return ivoaDocsLink(docsUrl, ivoaNameFromLabel(label));
  }
  return { url: docsUrl, label: `${label} docs` };
}

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
 * - Curated services win entirely: the curated label, IVOA standard link
 *   (labelled "IVOA <name> docs" by the curated `ivoaName`, else a name
 *   derived from the label), and version-selected URL, ignoring any discovery
 *   `title`/`docs_url`.
 * - Services absent from the map use the base URL and are labelled by their
 *   discovery `title`, falling back to
 *   {@link PresentationMap.untitledServiceLabels} and then the raw service
 *   name (Repertoire 2.x publishes no titles; a blank title counts as none,
 *   per {@link serviceDisplayName}). A discovery `docs_url` becomes the
 *   `docs` link, labelled "IVOA <name> docs" (named via
 *   {@link ivoaNameFromLabel}) when it points at an IVOA standard, otherwise
 *   "<label> docs"; without one, no docs link.
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
          const curated = presentation.services[serviceName];
          if (!curated) {
            const label = serviceDisplayName(
              service.title,
              presentation.untitledServiceLabels?.[serviceName] ?? serviceName
            );
            return {
              label,
              url: service.url,
              docs: discoveryDocsLink(service.docs_url, label),
            };
          }
          return {
            label: curated.label,
            url: selectServiceUrl(service, curated.url),
            docs: curated.ivoaUrl
              ? ivoaDocsLink(
                  curated.ivoaUrl,
                  curated.ivoaName ?? ivoaNameFromLabel(curated.label)
                )
              : null,
          };
        }
      ),
    };
  });
}

export type {
  ApiEndpoint,
  ApiEndpointDocsLink,
  ApiEndpointGroup,
} from './types';
