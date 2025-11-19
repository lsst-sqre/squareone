import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { ReactElement } from 'react';

import { getLayout } from '../../components/SettingsLayout';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { loadConfigAndMdx } from '../../lib/config/loader';
import { commonMdxComponents } from '../../lib/utils/mdxComponents';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type AccountPageProps = {
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
  mdxSource: any;
};

const mdxComponents = {
  ...commonMdxComponents,
};

const AccountPage: NextPageWithLayout &
  ((props: AccountPageProps) => ReactElement) = ({ mdxSource }) => {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Account settings | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Manage your account settings and preferences"
        />
        <meta property="og:title" key="ogtitle" content="Account settings" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Manage your account settings and preferences"
        />
      </Head>

      <MDXRemote {...mdxSource} components={mdxComponents} />
    </>
  );
};

AccountPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  AccountPageProps
> = async () => {
  try {
    // Load config and raw MDX content
    const { config: appConfig, mdxContent } = await loadConfigAndMdx(
      'settings__index.mdx'
    );

    // Serialize MDX content directly in getServerSideProps
    const mdxSource = await serialize(mdxContent);

    // Load footer MDX
    const { loadFooterMdx } = await import('../../lib/config/footerLoader');
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Required for AppConfigProvider in _app.tsx
        mdxSource,
        footerMdxSource,
      },
    };
  } catch (_error) {
    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../../lib/config/loader');
    const { loadFooterMdx } = await import('../../lib/config/footerLoader');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Account settings\n\nContent temporarily unavailable.'
    );
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Required for AppConfigProvider in _app.tsx
        mdxSource: fallbackMdx,
        footerMdxSource,
      },
    };
  }
};

export default AccountPage;
