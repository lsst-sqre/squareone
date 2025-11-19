import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { ReactElement, ReactNode } from 'react';

import MainContent from '../components/MainContent';
import { useAppConfig } from '../contexts/AppConfigContext';
import { loadConfigAndMdx } from '../lib/config/loader';
import { commonMdxComponents } from '../lib/utils/mdxComponents';

const mdxComponents = { ...commonMdxComponents };

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

type ApiAspectPageProps = {
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
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
    const { config: appConfig, mdxContent } =
      await loadConfigAndMdx('api-aspect.mdx');

    // Serialize MDX content directly in getServerSideProps using ES import
    const mdxSource = await serialize(mdxContent);

    // Load footer MDX
    const { loadFooterMdx } = await import('../lib/config/footerLoader');
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
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
      '# Rubin Science Platform APIs\n\nContent temporarily unavailable.'
    );
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
        footerMdxSource,
      },
    };
  }
};
