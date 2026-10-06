import type { Metadata } from 'next';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';
import {
  commonMdxComponents,
  compileMdxForRsc,
  DiscoveryApiEndpoints,
} from '../../lib/mdx/rsc';

// The <ApiEndpoints/> tag resolves discovery server-side, only when the
// per-environment prose uses it, so the endpoints are present in the
// server-rendered HTML (no client-side discovery fetch) and MDX-supplied props
// (e.g. headingLevel) flow through for editors to nest the listing under
// their page's heading hierarchy.
const mdxComponents = {
  ...commonMdxComponents,
  ApiEndpoints: DiscoveryApiEndpoints,
};

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
  const { content } = await compileMdxForRsc({
    contentPath: 'api-aspect.mdx',
    components: mdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
