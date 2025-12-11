import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { ReactElement, ReactNode } from 'react';

import MainContent from '../components/MainContent';
import { useAppConfig } from '../contexts/AppConfigContext';
import { loadConfigAndMdx } from '../lib/config/loader';
import { commonMdxComponents } from '../lib/utils/mdxComponents';
import styles from './support.module.css';

function Section({ children }: { children: React.ReactNode }) {
  return <section className={styles.section}>{children}</section>;
}

const mdxComponents = { ...commonMdxComponents, Section };

const pageDescription =
  'Get help with the Rubin Science Platform, data, and software.';

// Fallback MDX content for temporary unavailability
const FALLBACK_SUPPORT_MDX =
  '# Get help with the Rubin Science Platform\\n\\nContent temporarily unavailable.';

type SupportPageProps = {
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
  mdxSource: any;
};

export default function SupportPage({ mdxSource }: SupportPageProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">Get help | {appConfig.siteName}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Get help" />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <MDXRemote {...mdxSource} components={mdxComponents} />
    </>
  );
}

SupportPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  SupportPageProps
> = async () => {
  try {
    // Load config and raw MDX content
    const { config: appConfig, mdxContent } =
      await loadConfigAndMdx('support.mdx');

    // Serialize MDX content directly in getServerSideProps using ES import
    const mdxSource = await serialize(mdxContent);

    // Load footer MDX
    const { loadFooterMdx } = await import('../lib/config/footerLoader');
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Provided to _app.tsx which extracts into context
        mdxSource,
        footerMdxSource,
      },
    };
    // biome-ignore lint/correctness/noUnusedVariables: Error parameter kept for debugging purposes
  } catch (error) {
    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../lib/config/loader');
    const { loadFooterMdx } = await import('../lib/config/footerLoader');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(FALLBACK_SUPPORT_MDX);
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Provided to _app.tsx which extracts into context
        mdxSource: fallbackMdx,
        footerMdxSource,
      },
    };
  }
};
