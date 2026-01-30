import type { Metadata } from 'next';
import MainContent from '../../../components/MainContent';
import { getStaticConfig } from '../../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../../lib/mdx/rsc';

const pageDescription = 'Your account is pending approval';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Account pending approval | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Approval pending',
      description: pageDescription,
    },
  };
}

export default async function PendingApprovalPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'enrollment__pending-approval.mdx',
    components: commonMdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
