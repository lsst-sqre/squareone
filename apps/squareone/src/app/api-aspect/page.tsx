import type { Metadata } from 'next';
import ApiEndpoints, { type HeadingLevel } from '../../components/ApiEndpoints';
import MainContent from '../../components/MainContent';
import { resolveApiEndpoints } from '../../lib/apiEndpoints';
import { getStaticConfig } from '../../lib/config/rsc';
import logger from '../../lib/logger';
import { commonMdxComponents, compileMdxForRsc } from '../../lib/mdx/rsc';

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `APIs | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Rubin Science Platform APIs',
      description: pageDescription,
    },
  };
}

export default async function ApiAspectPage() {
  const config = await getStaticConfig();

  // Resolve the discovery-driven endpoint listing server-side so the endpoints
  // are present in the server-rendered HTML (no client-side discovery fetch).
  // Degrades gracefully when repertoireUrl is unset or the fetch fails.
  const apiEndpointsResult = await resolveApiEndpoints({
    repertoireUrl: config.repertoireUrl,
    logger,
  });

  // Bind the resolved listing into the <ApiEndpoints/> MDX component so the
  // per-environment prose can place it wherever it wants. MDX-supplied props
  // (e.g. headingLevel) flow through so editors can nest the listing under
  // their page's heading hierarchy.
  const mdxComponents = {
    ...commonMdxComponents,
    ApiEndpoints: (props: { headingLevel?: HeadingLevel }) => (
      <ApiEndpoints result={apiEndpointsResult} {...props} />
    ),
  };

  const { content } = await compileMdxForRsc({
    contentPath: 'api-aspect.mdx',
    components: mdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
