import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';
import { loadConfigAndMdx } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';

type PendingApprovalPageProps = {
  mdxSource: any;
};

export default function PendingApprovalPage({
  mdxSource,
}: PendingApprovalPageProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Account pending approval | ${appConfig.siteName}`}</title>
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
  try {
    // Load both config and MDX content using configurable mdxDir
    const { config: appConfig, mdxSource } = await loadConfigAndMdx(
      'enrollment/pending-approval.mdx'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource,
      },
    };
  } catch (error) {
    console.error('Failed to load pending approval page content:', error);

    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../../lib/config/loader');
    const { serialize } = await import('next-mdx-remote/serialize');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Account pending approval\\n\\nContent temporarily unavailable.'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
      },
    };
  }
};
