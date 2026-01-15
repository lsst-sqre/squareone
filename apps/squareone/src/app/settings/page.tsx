import type { Metadata } from 'next';

import { getStaticConfig } from '../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../lib/mdx/rsc';

const mdxComponents = {
  ...commonMdxComponents,
};

const pageDescription = 'Manage your account settings and preferences';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Account settings | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Account settings',
      description: pageDescription,
    },
  };
}

export default async function AccountPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'settings__index.mdx',
    components: mdxComponents,
  });

  return content;
}
