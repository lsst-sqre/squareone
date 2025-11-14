import { Button, getLoginUrl, useGafaelfawrUser } from '@lsst-sqre/squared';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import type { ReactElement } from 'react';
import AccessTokensView from '@/components/AccessTokensView';
import { Lede } from '@/components/Typography';
import { getLayout } from '../../components/SettingsLayout';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { loadAppConfig } from '../../lib/config/loader';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type AccessTokensPageProps = {
  // Add any page-specific props here
};

const AccessTokensPage: NextPageWithLayout &
  ((props: AccessTokensPageProps) => ReactElement) = () => {
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
          <title key="title">{`Access tokens | ${appConfig.siteName}`}</title>
        </Head>
        <div>Loading...</div>
      </>
    );
  }

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
      {user && (
        <>
          <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
            <AccessTokensView username={user.username} />
          </div>
          <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
            <Button
              appearance="outline"
              tone="secondary"
              as={Link}
              href="/settings/tokens/history"
            >
              View history
            </Button>
          </div>
        </>
      )}
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
