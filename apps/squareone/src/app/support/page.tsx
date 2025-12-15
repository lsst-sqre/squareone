import type { Metadata } from 'next';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';
import { commonMdxComponents, compileMdxForRsc } from '../../lib/mdx/rsc';
import styles from './support.module.css';

function Section({ children }: { children: React.ReactNode }) {
  return <section className={styles.section}>{children}</section>;
}

const mdxComponents = { ...commonMdxComponents, Section };

const pageDescription =
  'Get help with the Rubin Science Platform, data, and software.';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Get help | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Get help',
      description: pageDescription,
    },
  };
}

export default async function SupportPage() {
  const { content } = await compileMdxForRsc({
    contentPath: 'support.mdx',
    components: mdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
