import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';
import { loadConfigAndMdx } from '../lib/config/loader';
import { useAppConfig } from '../contexts/AppConfigContext';

const Section = styled.section`
  margin-bottom: 2rem;
`;

const mdxComponents = { ...commonMdxComponents, Section };

const pageDescription =
  'Get help with the Rubin Science Platform, data, and software.';

type SupportPageProps = {
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
    // Load both config and MDX content using configurable mdxDir
    const { config: appConfig, mdxSource } = await loadConfigAndMdx(
      'support.mdx'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource,
      },
    };
  } catch (error) {
    console.error('Failed to load support page content:', error);

    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../lib/config/loader');
    const { serialize } = await import('next-mdx-remote/serialize');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Get help with the Rubin Science Platform\\n\\nContent temporarily unavailable.'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
      },
    };
  }
};
