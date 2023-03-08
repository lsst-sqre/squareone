import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';

const Section = styled.section`
  margin-bottom: 2rem;
`;

const mdxComponents = { ...commonMdxComponents, Section };

const pageDescription =
  'Get help with the Rubin Science Platform, data, and software.';

export default function SupportPage({ publicRuntimeConfig, mdxSource }) {
  return (
    <>
      <Head>
        <title key="title">Get help | {publicRuntimeConfig.siteName}</title>
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

SupportPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

SupportPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

  const mdxSource = await serialize(publicRuntimeConfig.supportMdx);

  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
      mdxSource,
    },
  };
}
