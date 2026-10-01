import { Card, CardGroup, Note } from '@lsst-sqre/squared';
import type { Metadata } from 'next';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';
import {
  commonMdxComponents,
  compileMdxForRsc,
  DiscoveryDatasetDocsCards,
} from '../../lib/mdx/rsc';
import styles from './docs.module.css';

function Section({ children }: { children: React.ReactNode }) {
  return <section className={styles.section}>{children}</section>;
}

// The <DatasetDocsCards/> tag resolves discovery server-side, only when the
// page content uses it: environments whose docs.mdx still hardcodes its
// dataset cards make no discovery request for this page.
const mdxComponents = {
  ...commonMdxComponents,
  Section,
  Card,
  CardGroup,
  Note,
  DatasetDocsCards: DiscoveryDatasetDocsCards,
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
  // docs.mdx is loaded from the configured mdxDir, so the components above
  // (including <DatasetDocsCards>) are available both to the in-repo
  // development content and to the per-environment content Phalanx mounts.
  const { content } = await compileMdxForRsc({
    contentPath: 'docs.mdx',
    components: mdxComponents,
  });

  return <MainContent>{content}</MainContent>;
}
