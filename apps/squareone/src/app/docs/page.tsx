import { Card, CardGroup, Note } from '@lsst-sqre/squared';
import type { Metadata } from 'next';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../lib/mdx/rsc';
import styles from './docs.module.css';

function Section({ children }: { children: React.ReactNode }) {
  return <section className={styles.section}>{children}</section>;
}

const mdxComponents = {
  ...commonMdxComponents,
  Section,
  Card,
  CardGroup,
  Note,
};

const pageDescription =
  'Find documentation for Rubin Observatory data, science platform services, and software.';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Documentation | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Documentation',
      description: pageDescription,
    },
  };
}

export default async function DocsPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'docs.mdx',
    components: mdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
