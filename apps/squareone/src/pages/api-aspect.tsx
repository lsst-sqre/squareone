import Head from 'next/head';
import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';

const mdxComponents = { ...commonMdxComponents };

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

type ApiAspectPageProps = {
  publicRuntimeConfig: any;
  mdxSource: any;
};

export default function ApiAspectPage({
  publicRuntimeConfig,
  mdxSource,
}: ApiAspectPageProps) {
  return (
    <>
      <Head>
        <title key="title">APIs | {publicRuntimeConfig.siteName}</title>
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
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.apiAspectPageMdx);
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
      mdxSource,
    },
  };
};
