import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

export default function EmailVerifiedPage({ publicRuntimeConfig, mdxSource }) {
  return (
    <>
      <Head>
        <title key="title">
          Your email is verified | {publicRuntimeConfig.siteName}
        </title>
        <meta
          name="description"
          key="description"
          content="Your email is verified"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Your email is verified"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Your email is verified"
        />
      </Head>

      <MDXRemote {...mdxSource} components={commonMdxComponents} />
    </>
  );
}

EmailVerifiedPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

EmailVerifiedPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.emailVerifiedPageMdx);
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
}
