import Head from 'next/head';
import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

type PendingVerificationPageProps = {
  publicRuntimeConfig: any;
  mdxSource: any;
};

export default function PendingVerificationPage({
  publicRuntimeConfig,
  mdxSource,
}: PendingVerificationPageProps) {
  return (
    <>
      <Head>
        <title key="title">{`Please confirm your email | ${publicRuntimeConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Your email verification is pending"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Please confirm your email"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Your email verification is pending"
        />
      </Head>

      <MDXRemote {...mdxSource} components={commonMdxComponents} />
    </>
  );
}

PendingVerificationPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  PendingVerificationPageProps
> = async () => {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(
    publicRuntimeConfig.pendingVerificationPageMdx
  );
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
};
