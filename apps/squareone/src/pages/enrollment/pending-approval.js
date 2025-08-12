import Head from 'next/head';
import getConfig from 'next/config';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

export default function PendingApprovalPage({
  publicRuntimeConfig,
  mdxSource,
}) {
  return (
    <>
      <Head>
        <title key="title">{`Account pending approval | ${publicRuntimeConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Your account is pending approval"
        />
        <meta property="og:title" key="ogtitle" content="Approval pending" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Your account is pending approval"
        />
      </Head>

      <MDXRemote {...mdxSource} components={commonMdxComponents} />
    </>
  );
}

PendingApprovalPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

PendingApprovalPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.pendingApprovalPageMdx);
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
}
