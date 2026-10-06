/**
 * MDX component registries and discovery-backed tags for RSC-compiled content.
 *
 * Extends the base registries in `lib/utils/mdxComponents` with server-only
 * components, such as the discovery-backed `<ServiceLink>`. Those base
 * registries are also imported by the client-side Pages Router `Footer`, so
 * server-only code must not be added to them.
 *
 * Every tag that renders from Repertoire service discovery follows one shape:
 * an async server component that resolves discovery for the current request
 * (with the configured `repertoireUrl`, the server logger, and the Sentry
 * reporter) and passes the outcome to a props-driven component. Discovery is
 * therefore fetched only when a page's MDX uses the tag, and never on the
 * client. `<ServiceLink>` is in the common registries; `<ApiEndpoints>` and
 * `<DatasetDocsCards>` are exported for their pages to register.
 *
 * The common registry also maps `pre` to `MdxCodeBlock`, so fenced code blocks
 * with a language render through squared's syntax-highlighting `CodeBlock`.
 */

import { CodeBlock } from '@lsst-sqre/squared';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { cache, isValidElement } from 'react';

import ApiEndpoints, {
  type ApiEndpointsProps,
} from '../../../components/ApiEndpoints';
import DatasetDocsCards, {
  type DatasetDocsCardsProps,
} from '../../../components/DatasetDocsCards';
import ServiceLink, {
  type ServiceLinkProps,
} from '../../../components/ServiceLink';
import { resolveApiEndpoints } from '../../apiEndpoints';
import { getStaticConfig } from '../../config/rsc';
import { resolveDatasetDocs } from '../../datasetDocs';
import type { DiscoveryRenderOptions } from '../../discovery/fetchDiscoveryForRender';
import logger from '../../logger';
import { makeReportError } from '../../sentry/reportError';
import { resolveServiceLink } from '../../serviceLink';
import {
  commonMdxComponents as baseCommonMdxComponents,
  footerMdxComponents as baseFooterMdxComponents,
} from '../../utils/mdxComponents';

/**
 * The discovery resolver options for the current request: the configured
 * Repertoire URL with the server logger and Sentry reporter.
 */
const getDiscoveryRenderOptions = cache(
  async (): Promise<DiscoveryRenderOptions> => {
    const config = await getStaticConfig();
    return {
      repertoireUrl: config.repertoireUrl,
      logger,
      reportError: makeReportError({ isServer: true }),
    };
  }
);

/**
 * Per-request resolvers, memoized with React `cache()` so repeated tags on a
 * page (e.g. two COmanage links in `settings__index.mdx`) share one
 * resolution, and at most one failure log and error report. All of them share
 * the repertoire-client's cached discovery document.
 */
const resolveApiEndpointsForRequest = cache(async () =>
  resolveApiEndpoints(await getDiscoveryRenderOptions())
);
const resolveDatasetDocsForRequest = cache(async () =>
  resolveDatasetDocs(await getDiscoveryRenderOptions())
);
const resolveServiceLinkForRequest = cache(async (service: string) =>
  resolveServiceLink({ service, ...(await getDiscoveryRenderOptions()) })
);

/** Props of the `<ApiEndpoints>` MDX tag (e.g. `headingLevel`). */
export type ApiEndpointsTagProps = Omit<ApiEndpointsProps, 'result'>;

/**
 * The `<ApiEndpoints>` tag as registered for the `/api-aspect` MDX.
 *
 * Renders the discovery-driven endpoint listing wherever the per-environment
 * prose places it. Degrades to nothing when `repertoireUrl` is unset and to a
 * brief notice when discovery fails.
 */
export async function DiscoveryApiEndpoints(props: ApiEndpointsTagProps) {
  const result = await resolveApiEndpointsForRequest();
  return <ApiEndpoints result={result} {...props} />;
}

/** Props of the `<DatasetDocsCards>` MDX tag (`headingLevel` and children). */
export type DatasetDocsCardsTagProps = Omit<DatasetDocsCardsProps, 'result'>;

/**
 * The `<DatasetDocsCards>` tag as registered for the `/docs` MDX.
 *
 * Renders one card per discovered dataset under the tag's children (such as
 * the section heading). Environments whose `docs.mdx` still hardcodes its
 * dataset cards make no discovery request for the page. Degrades to nothing
 * when `repertoireUrl` is unset and to the children with a brief notice when
 * discovery fails.
 */
export async function DiscoveryDatasetDocsCards(
  props: DatasetDocsCardsTagProps
) {
  const result = await resolveDatasetDocsForRequest();
  return <DatasetDocsCards result={result} {...props} />;
}

/** Props of the `<ServiceLink>` MDX tag. */
export type ServiceLinkTagProps = Omit<ServiceLinkProps, 'result'> & {
  /** Name of the UI service in discovery's `services.ui` (e.g. `comanage`). */
  service: string;
};

/**
 * The `<ServiceLink service="…">` tag as registered for MDX content.
 *
 * Degrades to no link when `repertoireUrl` is unset, discovery fails, or the
 * service isn't listed.
 */
export async function DiscoveryServiceLink({
  service,
  ...props
}: ServiceLinkTagProps) {
  const result = await resolveServiceLinkForRequest(service);
  return <ServiceLink result={result} {...props} />;
}

/** A fenced code block's language and source text. */
type FencedCode = { language: string; code: string };

/**
 * Read a fenced code block from the children of an MDX `<pre>`.
 *
 * MDX compiles ```` ```json ```` to `<pre><code className="language-json">`
 * with the block's text, plus a trailing newline, as the code's children.
 * Returns `null` for any other `<pre>`: one whose child isn't a single `code`
 * element with a `language-*` class and plain-text content.
 */
function readFencedCode(children: ReactNode): FencedCode | null {
  if (!isValidElement<ComponentProps<'code'>>(children)) return null;
  if (children.type !== 'code') return null;
  const { className, children: code } = children.props;
  const language = className?.match(/(?:^|\s)language-(\S+)/)?.[1];
  if (!language || typeof code !== 'string') return null;
  return { language, code: code.replace(/\n$/, '') };
}

/**
 * The `pre` element of RSC-compiled MDX content.
 *
 * A fenced code block with a language (```` ```python ````) renders through
 * squared's `CodeBlock`, with a copy button and no line numbers. Any other
 * `<pre>`, including a fenced block without a language, renders unchanged.
 * This is a server component: highlighting happens in `CodeBlock`'s client
 * boundary, so the server-rendered HTML is plain monospace text.
 */
export function MdxCodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const fenced = readFencedCode(children);
  if (!fenced) return <pre {...props}>{children}</pre>;
  return (
    <CodeBlock
      code={fenced.code}
      language={fenced.language}
      copy
      lineNumbers={false}
    />
  );
}

/**
 * Components available to every RSC-compiled MDX page (`/settings`,
 * `/support`, `/docs`, `/api-aspect`, and the enrollment pages).
 */
// biome-ignore lint/suspicious/noExplicitAny: MDX components accept any props
export const commonMdxComponents: Record<string, ComponentType<any>> = {
  ...baseCommonMdxComponents,
  ServiceLink: DiscoveryServiceLink,
  pre: MdxCodeBlock,
};

/** Components available to the RSC-compiled footer MDX. */
// biome-ignore lint/suspicious/noExplicitAny: MDX components accept any props
export const footerMdxComponents: Record<string, ComponentType<any>> = {
  ...baseFooterMdxComponents,
  ServiceLink: DiscoveryServiceLink,
};
