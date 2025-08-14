import Head from 'next/head';
import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

type VerifyEmailPageProps = {
  publicRuntimeConfig: any;
  mdxSource: any;
};

export default function VerifyEmailPage({
  publicRuntimeConfig,
  mdxSource,
}: VerifyEmailPageProps) {
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

VerifyEmailPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  VerifyEmailPageProps
> = async () => {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.verifyEmailPageMdx);
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
};
