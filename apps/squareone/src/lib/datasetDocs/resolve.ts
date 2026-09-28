import { serviceDiscoveryToDatasetSummaries } from '../apiEndpoints/transform';
import {
  type DiscoveryRenderOptions,
  fetchDiscoveryForRender,
} from '../discovery/fetchDiscoveryForRender';
import type { DatasetDocsResult } from './types';

export type ResolveDatasetDocsOptions = DiscoveryRenderOptions;

/**
 * Resolve the dataset documentation cards for the `/docs` page server-side.
 *
 * Degrades gracefully via {@link fetchDiscoveryForRender}: `omitted` without a
 * `repertoireUrl` (the page leaves the cards out), `unavailable` when the
 * fetch fails (the page shows a brief notice; the failure is logged and, when
 * report-worthy, reported under the `docs-dataset-discovery` site), and `ok`
 * with one entry per dataset from {@link serviceDiscoveryToDatasetSummaries}.
 */
export async function resolveDatasetDocs(
  options: ResolveDatasetDocsOptions
): Promise<DatasetDocsResult> {
  const fetched = await fetchDiscoveryForRender({
    ...options,
    site: 'docs-dataset-discovery',
    purpose: 'the /docs dataset cards',
  });
  if (fetched.status !== 'ok') {
    return fetched;
  }
  return {
    status: 'ok',
    datasets: serviceDiscoveryToDatasetSummaries(fetched.discovery),
  };
}
