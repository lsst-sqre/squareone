import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { Lede } from '@/components/Typography';
import { Button } from '@lsst-sqre/squared';

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
        <title key="title">{`Access tokens | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Manage your RSP API access tokens"
        />
        <meta property="og:title" key="ogtitle" content="Access Tokens" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Manage your RSP API access tokens"
        />
      </Head>

      <h1>Access tokens</h1>
      <Lede>Manage your RSP API access tokens.</Lede>
      <Button role="primary" as={Link} href="/settings/tokens/new">
        Create a token
      </Button>
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
