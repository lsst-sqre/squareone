import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type AccessTokensPageProps = {
  // Add any page-specific props here
};

const AccessTokensPage: NextPageWithLayout &
  ((props: AccessTokensPageProps) => ReactElement) = () => {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Access Tokens | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Manage your API access tokens and authentication credentials"
        />
        <meta property="og:title" key="ogtitle" content="Access Tokens" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Manage your API access tokens and authentication credentials"
        />
      </Head>

      <h1>Access Tokens</h1>
      <p>
        Create and manage access tokens for programmatic access to the Rubin
        Science Platform APIs. Access tokens allow you to authenticate with
        services without using your password.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    </>
  );
};

AccessTokensPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  AccessTokensPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default AccessTokensPage;
