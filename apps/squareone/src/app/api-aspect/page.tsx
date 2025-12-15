import type { Metadata } from 'next';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../lib/mdx/rsc';

const mdxComponents = { ...commonMdxComponents };

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
