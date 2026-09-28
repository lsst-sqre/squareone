import {
  type DiscoveryRenderOptions,
  fetchDiscoveryForRender,
} from '../discovery/fetchDiscoveryForRender';
import { serviceDiscoveryToApiEndpointGroups } from './transform';
import type { ApiEndpointsResult } from './types';

export type ResolveApiEndpointsOptions = DiscoveryRenderOptions;

/**
 * Resolve the API endpoint listing for the `/api-aspect` page server-side.
 *
 * Degrades gracefully via {@link fetchDiscoveryForRender}: `omitted` without a
 * `repertoireUrl` (the page leaves the section out), `unavailable` when the
 * fetch fails (the page shows a brief notice; the failure is logged and, when
 * report-worthy, reported under the `api-aspect-discovery` site), and `ok`
 * with the dataset groups from {@link serviceDiscoveryToApiEndpointGroups}.
 */
export async function resolveApiEndpoints(
  options: ResolveApiEndpointsOptions
): Promise<ApiEndpointsResult> {
  const fetched = await fetchDiscoveryForRender({
    ...options,
    site: 'api-aspect-discovery',
    purpose: '/api-aspect',
  });
  if (fetched.status !== 'ok') {
    return fetched;
  }
  return {
    status: 'ok',
    groups: serviceDiscoveryToApiEndpointGroups(fetched.discovery),
  };
}
