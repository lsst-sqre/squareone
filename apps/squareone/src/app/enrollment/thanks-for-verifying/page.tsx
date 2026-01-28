import type { Metadata } from 'next';
import MainContent from '../../../components/MainContent';
import { getStaticConfig } from '../../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../../lib/mdx/rsc';

const pageDescription = 'Your email is verified';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Your email is verified | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Your email is verified',
      description: pageDescription,
    },
  };
}

export default async function ThanksForVerifyingPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'enrollment__thanks-for-verifying.mdx',
    components: commonMdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
