import type { Metadata } from 'next';
import MainContent from '../../../components/MainContent';
import { getStaticConfig } from '../../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../../lib/mdx/rsc';

const pageDescription = 'Thanks for registering';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Thanks for registering | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Thanks for registering',
      description: pageDescription,
    },
  };
}

export default async function ThanksForSigningUpPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'enrollment__thanks-for-signing-up.mdx',
    components: commonMdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
