import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../../components/MainContent';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';
import { loadConfigAndMdx } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';

type EmailVerifiedPageProps = {
  mdxSource: any;
};

export default function EmailVerifiedPage({
  mdxSource,
}: EmailVerifiedPageProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Your email is verified | ${appConfig.siteName}`}</title>
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
  try {
    // Load both config and MDX content using configurable mdxDir
    const { config: appConfig, mdxSource } = await loadConfigAndMdx(
      'enrollment/thanks-for-verifying.mdx'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource,
      },
    };
  } catch (error) {
    console.error('Failed to load thanks for verifying page content:', error);

    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../../lib/config/loader');
    const { serialize } = await import('next-mdx-remote/serialize');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Your email is verified\\n\\nContent temporarily unavailable.'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
      },
    };
  }
};
