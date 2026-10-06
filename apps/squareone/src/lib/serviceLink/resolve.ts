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
 * Names of the UI services already warned about as missing from discovery in
 * this process. A misnamed service is a content error that persists until the
 * MDX changes, and `<ServiceLink>` is in the footer registry too, so warning
 * on every request would flood the server log; the per-request `cache()` in
 * `lib/mdx/rsc/components.tsx` only dedupes within one render.
 */
const warnedMissingServices = new Set<string>();

/**
 * Reset the once-per-process missing-service warning state. Exported for
 * tests only; there is no need to call this in production code.
 */
export function __resetMissingServiceWarnings(): void {
  warnedMissingServices.clear();
}

/**
 * Resolve a `<ServiceLink>` MDX tag's UI service URL server-side.
 *
 * Degrades gracefully via {@link fetchDiscoveryForRender}: `omitted` without a
 * `repertoireUrl`, and `unavailable` when the fetch fails (logged and, when
 * report-worthy, reported under the `service-link-discovery` site, both with
 * the `service` name). On success:
 * - discovery lists no `services.ui.<service>` -> `missing` on every call,
 *   logged as a warning at most once per process per service name (a content
 *   author named a service this environment doesn't have, which stays wrong
 *   until the content changes; see {@link warnedMissingServices});
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
    // Only a warning that reached a logger counts as warned.
    if (options.logger && !warnedMissingServices.has(service)) {
      warnedMissingServices.add(service);
      options.logger.warn(
        { service },
        'UI service for a <ServiceLink> is not in service discovery'
      );
    }
    return { status: 'missing' };
  }
  return { status: 'ok', url };
}
