import Head from 'next/head';
import getConfig from 'next/config';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

type PendingApprovalPageProps = {
  publicRuntimeConfig: any;
  mdxSource: any;
};

export default function PendingApprovalPage({
  publicRuntimeConfig,
  mdxSource,
}: PendingApprovalPageProps) {
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

PendingApprovalPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  PendingApprovalPageProps
> = async () => {
  const { publicRuntimeConfig } = getConfig();
  const mdxSource = await serialize(publicRuntimeConfig.pendingApprovalPageMdx);
  return {
    props: {
      publicRuntimeConfig,
      mdxSource,
    },
  };
};
