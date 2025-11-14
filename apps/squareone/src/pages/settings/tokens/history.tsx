import { getLoginUrl, useGafaelfawrUser } from '@lsst-sqre/squared';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement } from 'react';
import { getLayout } from '../../../components/SettingsLayout';
import { TokenHistoryView } from '../../../components/TokenHistory';
import { useAppConfig } from '../../../contexts/AppConfigContext';
import { loadAppConfig } from '../../../lib/config/loader';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

const TokensHistoryPage: NextPageWithLayout & (() => ReactElement) = () => {
  const appConfig = useAppConfig();
  const { user, isLoggedIn, isLoading } = useGafaelfawrUser();

  // Handle authentication
  if (!isLoading && !isLoggedIn) {
    const loginUrl = getLoginUrl(window.location.href);
    window.location.href = loginUrl;
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title key="title">{`Access token history | ${appConfig.siteName}`}</title>
        </Head>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Access token history | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="View the change history for your RSP access tokens"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Access token history"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="View the change history for your RSP access tokens"
        />
      </Head>

      <h1>Token History</h1>
      {user && (
        <TokenHistoryView
          username={user.username}
          initialTokenType="user"
          showFilters={true}
        />
      )}
    </>
  );
};

TokensHistoryPage.getLayout = getLayout;

// REQUIRED: Load appConfig for AppConfigProvider in _app.tsx
export const getServerSideProps: GetServerSideProps = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
    },
  };
};

export default TokensHistoryPage;
