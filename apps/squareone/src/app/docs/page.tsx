import { Card, CardGroup, Note } from '@lsst-sqre/squared';
import type { Metadata } from 'next';
import DatasetDocsCards, {
  type DatasetDocsCardsProps,
} from '../../components/DatasetDocsCards';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';
import { resolveDatasetDocs } from '../../lib/datasetDocs';
import logger from '../../lib/logger';
import { commonMdxComponents, compileMdxForRsc } from '../../lib/mdx/rsc';
import { makeReportError } from '../../lib/sentry/reportError';
import styles from './docs.module.css';

function Section({ children }: { children: React.ReactNode }) {
  return <section className={styles.section}>{children}</section>;
}

/**
 * The `<DatasetDocsCards>` tag as registered for the docs MDX.
 *
 * An async server component, so service discovery is resolved (server-side,
 * into the rendered HTML) only when the page content actually uses the tag:
 * environments whose `docs.mdx` still hardcodes its dataset cards make no
 * discovery request for this page. Degrades gracefully when `repertoireUrl`
 * is unset or the fetch fails. MDX-supplied props (`headingLevel`, and
 * children such as the section heading) flow through.
 */
async function DiscoveryDatasetDocsCards(
  props: Omit<DatasetDocsCardsProps, 'result'>
) {
  const config = await getStaticConfig();
  const result = await resolveDatasetDocs({
    repertoireUrl: config.repertoireUrl,
    logger,
    reportError: makeReportError({ isServer: true }),
  });
  return <DatasetDocsCards result={result} {...props} />;
}

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
