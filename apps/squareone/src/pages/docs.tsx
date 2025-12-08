import { Card, CardGroup, Note } from '@lsst-sqre/squared';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';

import MainContent from '../components/MainContent';
import { useAppConfig } from '../contexts/AppConfigContext';
import { loadConfigAndMdx } from '../lib/config/loader';
import { commonMdxComponents } from '../lib/utils/mdxComponents';

const Section = styled.section`
  margin-top: 2rem;
`;

const mdxComponents = {
  ...commonMdxComponents,
  Section,
  Card,
  CardGroup,
  Note,
};

const pageDescription =
  'Find documentation for Rubin Observatory data, science platform services, and software.';

type DocsPageProps = {
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
  mdxSource: any;
};

export default function DocsPage({ mdxSource }: DocsPageProps) {
  const appConfig = useAppConfig();

  // Check for specific components that might be undefined
  const problematicComponents = Object.entries(mdxComponents).filter(
    ([_key, comp]) => !comp
  );
  if (problematicComponents.length > 0) {
    console.error(
      'Undefined components:',
      problematicComponents.map(([key]) => key)
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Documentation | ${appConfig.siteName}`}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Documentation" />
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

DocsPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  DocsPageProps
> = async () => {
  try {
    // Load config and raw MDX content
    const { config: appConfig, mdxContent } =
      await loadConfigAndMdx('docs.mdx');

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
  } catch (_error) {
    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../lib/config/loader');
    const { loadFooterMdx } = await import('../lib/config/footerLoader');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Documentation\n\nContent temporarily unavailable.'
    );
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
