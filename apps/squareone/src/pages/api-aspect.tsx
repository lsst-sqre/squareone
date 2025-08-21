import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';
import { loadConfigAndMdx } from '../lib/config/loader';
import { useAppConfig } from '../contexts/AppConfigContext';

const mdxComponents = { ...commonMdxComponents };

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

type ApiAspectPageProps = {
  mdxSource: any;
};

export default function ApiAspectPage({ mdxSource }: ApiAspectPageProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">APIs | {appConfig.siteName}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta
          property="og:title"
          key="ogtitle"
          content="Rubin Science Platform APIs"
        />
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

ApiAspectPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  ApiAspectPageProps
> = async () => {
  try {
    // Load config and raw MDX content
    const { config: appConfig, mdxContent } = await loadConfigAndMdx(
      'api-aspect.mdx'
    );

    // Serialize MDX content directly in getServerSideProps using ES import
    const mdxSource = await serialize(mdxContent);

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource,
      },
    };
  } catch (error) {
    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../lib/config/loader');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Rubin Science Platform APIs\n\nContent temporarily unavailable.'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
      },
    };
  }
};
