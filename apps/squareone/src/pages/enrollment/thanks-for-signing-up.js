import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

export default function VerifyEmailPage({ publicRuntimeConfig, mdxSource }) {
  return (
    <>
      <Head>
        <title key="title">{`Thanks for registering | ${publicRuntimeConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Thanks for registering"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Thanks for registering"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Thanks for registering"
        />
      </Head>

      <MDXRemote {...mdxSource} components={commonMdxComponents} />
    </>
  );
}

VerifyEmailPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

VerifyEmailPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.verifyEmailPageMdx);
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
}
