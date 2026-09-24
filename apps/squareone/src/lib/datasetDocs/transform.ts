import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import {
  presentationMap as defaultPresentationMap,
  orderDatasetKeys,
  type PresentationMap,
} from '../apiEndpoints/presentation';
import type { DatasetDoc } from './types';

/**
 * Transform Repertoire service discovery into the `/docs` dataset cards.
 *
 * Emits one {@link DatasetDoc} per discovered dataset, ordered by
 * {@link orderDatasetKeys} (releases newest-first, `prompt` pinned second,
 * unrecognized datasets after in discovery order), with the display name from
 * the presentation map's `datasetDisplayNames` (falling back to the raw key)
 * and the dataset's discovery `description` and `docs_url` (each `null` when
 * discovery omits it, as data-dev does for the `prompt` dataset's `docs_url`).
 *
 * Pure and parameterized by `presentation` (defaulting to the app's curated
 * map, shared with `/api-aspect`) so tests can inject their own display names.
 * A discovery with no datasets yields `[]`.
 */
export function serviceDiscoveryToDatasetDocs(
  discovery: ServiceDiscovery,
  presentation: PresentationMap = defaultPresentationMap
): DatasetDoc[] {
  const datasets = discovery.datasets ?? {};

  return orderDatasetKeys(Object.keys(datasets)).map((datasetKey) => {
    const dataset = datasets[datasetKey];
    return {
      datasetKey,
      displayName: presentation.datasetDisplayNames[datasetKey] ?? datasetKey,
      description: dataset.description ?? null,
      docsUrl: dataset.docs_url ?? null,
    };
  });
}
