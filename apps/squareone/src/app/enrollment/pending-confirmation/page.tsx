import type { Metadata } from 'next';
import MainContent from '../../../components/MainContent';
import { getStaticConfig } from '../../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../../lib/mdx/rsc';

const pageDescription = 'Your email verification is pending';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Please confirm your email | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Please confirm your email',
      description: pageDescription,
    },
  };
}

export default async function PendingConfirmationPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'enrollment__pending-confirmation.mdx',
    components: commonMdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
