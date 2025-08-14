import Head from 'next/head';
import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

type EmailVerifiedPageProps = {
  publicRuntimeConfig: any;
  mdxSource: any;
};

export default function EmailVerifiedPage({
  publicRuntimeConfig,
  mdxSource,
}: EmailVerifiedPageProps) {
  return (
    <>
      <Head>
        <title key="title">{`Your email is verified | ${publicRuntimeConfig.siteName}`}</title>
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

EmailVerifiedPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  EmailVerifiedPageProps
> = async () => {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.emailVerifiedPageMdx);
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
};
