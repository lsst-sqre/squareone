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
    // Deduplicated (first-seen order kept) so a scope discovery repeats
    // renders one pill and appears once in the token template link. The
    // repertoire-client schema already defaults `required_scopes` to `[]`
    // (including under Repertoire 2.x, which omits it), so `?? []` only guards
    // hand-built `as unknown as ServiceDiscovery` fixtures that skip parsing.
    requiredScopes: [...new Set(service.required_scopes ?? [])],
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
 * (or a service with no entry) falls through to discovery. From discovery, the
 * label is the service `title` (else the raw service name), the docs link is
 * the service `docs_url`, and the URL is the `url` of the service's only
 * version when its `versions` map has exactly one entry, else the base `url`
 * (choosing among several versions needs a curated `url` selector; see
 * `discoveryServiceUrl` in `presentation.ts`).
 * Every endpoint, curated or not, also carries the service's discovery
 * `required_scopes` as `requiredScopes`, deduplicated in first-seen order
 * (empty when discovery declares none, as under Repertoire 2.x).
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
