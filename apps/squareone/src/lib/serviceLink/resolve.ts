import { createDiscoveryQuery } from '@lsst-sqre/repertoire-client';

import {
  type DiscoveryRenderOptions,
  fetchDiscoveryForRender,
} from '../discovery/fetchDiscoveryForRender';
import type { ServiceLinkResult } from './types';

export type ResolveServiceLinkOptions = DiscoveryRenderOptions & {
  /** Name of the UI service in discovery's `services.ui` (e.g. `comanage`). */
  service: string;
};

/**
 * Resolve a `<ServiceLink>` MDX tag's UI service URL server-side.
 *
 * Degrades gracefully via {@link fetchDiscoveryForRender}: `omitted` without a
 * `repertoireUrl`, and `unavailable` when the fetch fails (logged and, when
 * report-worthy, reported under the `service-link-discovery` site, both with
 * the `service` name). On success:
 * - discovery lists no `services.ui.<service>` -> `missing`, logged as a
 *   warning (a content author named a service this environment doesn't have);
 * - otherwise `ok` with the service's discovered `url`.
 */
export async function resolveServiceLink({
  service,
  ...options
}: ResolveServiceLinkOptions): Promise<ServiceLinkResult> {
  const fetched = await fetchDiscoveryForRender({
    ...options,
    site: 'service-link-discovery',
    purpose: 'a <ServiceLink>',
    context: { service },
  });
  if (fetched.status !== 'ok') {
    return fetched;
  }

  const url = createDiscoveryQuery(fetched.discovery).getUiServiceUrl(service);
  if (!url) {
    options.logger?.warn(
      { service },
      'UI service for a <ServiceLink> is not in service discovery'
    );
    return { status: 'missing' };
  }
  return { status: 'ok', url };
}
