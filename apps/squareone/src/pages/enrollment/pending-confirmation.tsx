import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { ReactElement, ReactNode } from 'react';

import MainContent from '../../components/MainContent';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { loadFooterMdx } from '../../lib/config/footerLoader';
import { loadConfigAndMdx } from '../../lib/config/loader';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

type PendingVerificationPageProps = {
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
  mdxSource: any;
};

export default function PendingVerificationPage({
  mdxSource,
}: PendingVerificationPageProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Please confirm your email | ${appConfig.siteName}`}</title>
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
  try {
    // Load config and raw MDX content
    const { config: appConfig, mdxContent } = await loadConfigAndMdx(
      'enrollment__pending-confirmation.mdx'
    );

    // Serialize MDX content directly in getServerSideProps using ES import
    const mdxSource = await serialize(mdxContent);
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource,
        footerMdxSource,
      },
    };
  } catch (error) {
    console.error('Failed to load pending confirmation page content:', error);

    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../../lib/config/loader');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Please confirm your email\\n\\nContent temporarily unavailable.'
    );
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
        footerMdxSource,
      },
    };
  }
};
