import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';

const mdxComponents = { ...commonMdxComponents };

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

export default function ApiAspectPage({ publicRuntimeConfig, mdxSource }) {
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

ApiAspectPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

ApiAspectPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.apiAspectPageMdx);
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
      mdxSource,
    },
  };
}
