/**
 * MDX component registries for RSC-compiled content.
 *
 * Extends the base registries in `lib/utils/mdxComponents` with server-only
 * components, such as the discovery-backed `<ServiceLink>`. Those base
 * registries are also imported by the client-side Pages Router `Footer`, so
 * server-only code must not be added to them.
 */

import type { ComponentType } from 'react';
import { cache } from 'react';

import ServiceLink, {
  type ServiceLinkProps,
} from '../../../components/ServiceLink';
import { getStaticConfig } from '../../config/rsc';
import logger from '../../logger';
import { makeReportError } from '../../sentry/reportError';
import { resolveServiceLink, type ServiceLinkResult } from '../../serviceLink';
import {
  commonMdxComponents as baseCommonMdxComponents,
  footerMdxComponents as baseFooterMdxComponents,
} from '../../utils/mdxComponents';

/**
 * Resolve a UI service's link for the current request.
 *
 * Memoized per request with React `cache()`, so repeated links to the same
 * service on a page (e.g. two COmanage links in `settings__index.mdx`) share
 * one resolution — and at most one failure log and error report. Different
 * services share the repertoire-client's cached discovery document.
 */
const resolveServiceLinkForRequest = cache(
  async (service: string): Promise<ServiceLinkResult> => {
    const config = await getStaticConfig();
    return resolveServiceLink({
      service,
      repertoireUrl: config.repertoireUrl,
      logger,
      reportError: makeReportError({ isServer: true }),
    });
  }
);

/** Props of the `<ServiceLink>` MDX tag. */
export type ServiceLinkTagProps = Omit<ServiceLinkProps, 'result'> & {
  /** Name of the UI service in discovery's `services.ui` (e.g. `comanage`). */
  service: string;
};

/**
 * The `<ServiceLink service="…">` tag as registered for MDX content.
 *
 * An async server component, so discovery is resolved (server-side, into the
 * rendered HTML) only when the content uses the tag. Degrades to no link when
 * `repertoireUrl` is unset, discovery fails, or the service isn't listed.
 */
async function DiscoveryServiceLink({
  service,
  ...props
}: ServiceLinkTagProps) {
  const result = await resolveServiceLinkForRequest(service);
  return <ServiceLink result={result} {...props} />;
}

/**
 * Components available to every RSC-compiled MDX page (`/settings`,
 * `/support`, `/docs`, `/api-aspect`, and the enrollment pages).
 */
// biome-ignore lint/suspicious/noExplicitAny: MDX components accept any props
export const commonMdxComponents: Record<string, ComponentType<any>> = {
  ...baseCommonMdxComponents,
  ServiceLink: DiscoveryServiceLink,
};

/** Components available to the RSC-compiled footer MDX. */
// biome-ignore lint/suspicious/noExplicitAny: MDX components accept any props
export const footerMdxComponents: Record<string, ComponentType<any>> = {
  ...baseFooterMdxComponents,
  ServiceLink: DiscoveryServiceLink,
};
