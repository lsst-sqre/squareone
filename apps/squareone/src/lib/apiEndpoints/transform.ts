import type {
  DataService,
  ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';

import { serviceDisplayName } from '../discovery/serviceDisplayName';
import {
  presentationMap as defaultPresentationMap,
  isIvoaStandardUrl,
  ivoaNameFromLabel,
  orderDatasetKeys,
  type PresentationMap,
  type ServicePresentation,
  selectServiceUrl,
} from './presentation';
import type {
  ApiEndpoint,
  ApiEndpointDocsLink,
  ApiEndpointGroup,
} from './types';

/**
 * Resolve an endpoint's docs link from its presentation `entry` and discovery
 * `docsUrl`, per the docs rule on {@link PresentationMap}. An empty URL counts
 * as absent.
 */
function resolveDocsLink(
  entry: ServicePresentation,
  docsUrl: string | null | undefined,
  label: string
): ApiEndpointDocsLink | null {
  const url = entry.ivoaUrl || docsUrl;
  if (!url) {
    return null;
  }
  if (entry.ivoaUrl || isIvoaStandardUrl(url)) {
    const name = entry.ivoaName ?? ivoaNameFromLabel(label);
    return { url, label: `IVOA ${name} docs` };
  }
  return { url, label: `${label} docs` };
}

/**
 * Resolve one discovered service into an endpoint by merging its presentation
 * `entry` over discovery, per the precedence rule on {@link PresentationMap}.
 * A service without an entry passes `{}` and so takes every value from
 * discovery.
 */
function resolveEndpoint(
  serviceName: string,
  service: DataService,
  entry: ServicePresentation
): ApiEndpoint {
  const label =
    entry.label ??
    serviceDisplayName(service.title, entry.untitledLabel ?? serviceName);
  return {
    label,
    url: selectServiceUrl(service, entry.url),
    docs: resolveDocsLink(entry, service.docs_url, label),
  };
}

/**
 * Transform Repertoire service discovery into the `/api-aspect` listing,
 * applying the curated {@link PresentationMap}.
 *
 * Emits one {@link ApiEndpointGroup} per discovered dataset, ordered by
 * {@link orderDatasetKeys} (releases newest-first, `prompt` pinned second,
 * unrecognized datasets after in discovery order). Each group resolves the
 * dataset display name (falling back to the raw key) and carries the dataset
 * `docs_url` and `description`. Every service under a dataset is rendered as
 * an endpoint whose label, URL, and docs link merge the service's
 * `presentation.services` entry over its discovery metadata by the precedence
 * rule on {@link PresentationMap}: a curated field wins, and an absent field
 * (or a service with no entry) falls through to discovery.
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
        ([serviceName, service]) =>
          resolveEndpoint(
            serviceName,
            service,
            presentation.services[serviceName] ?? {}
          )
      ),
    };
  });
}

export type {
  ApiEndpoint,
  ApiEndpointDocsLink,
  ApiEndpointGroup,
} from './types';
