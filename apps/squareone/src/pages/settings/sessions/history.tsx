import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { getLayout } from '../../../components/SettingsLayout';
import { loadAppConfig } from '../../../lib/config/loader';
import { useAppConfig } from '../../../contexts/AppConfigContext';
import { useGafaelfawrUser, getLoginUrl, Tabs } from '@lsst-sqre/squared';
import { TokenHistoryView } from '../../../components/TokenHistory';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type SessionTokensHistoryPageProps = {
  // Add any page-specific props here
};

// Map URL tab type to TokenHistoryView initialTokenType prop
function mapTabTypeToTokenType(
  tabType: string
): 'session' | 'notebook' | 'internal' {
  switch (tabType) {
    case 'web':
      return 'session';
    case 'notebook':
      return 'notebook';
    case 'internal':
      return 'internal';
    default:
      return 'session';
  }
}

const SessionTokensHistoryPage: NextPageWithLayout &
  ((props: SessionTokensHistoryPageProps) => ReactElement) = () => {
  const appConfig = useAppConfig();
  const { user, isLoggedIn, isLoading } = useGafaelfawrUser();
  const router = useRouter();

  // Get active tab from URL query parameter, default to 'web'
  const activeTab = (router.query.type as string) || 'web';

  // Handle tab change by updating URL query parameter while preserving filters
  const handleTabChange = (value: string) => {
    const query = { ...router.query, type: value };
    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

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
          <title key="title">{`Session History | ${appConfig.siteName}`}</title>
        </Head>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Session History | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="View the change history for your RSP session tokens"
        />
        <meta property="og:title" key="ogtitle" content="Session History" />
        <meta
          property="og:description"
          key="ogdescription"
          content="View the change history for your RSP session tokens"
        />
      </Head>

      <h1>Session History</h1>
      {user && (
        <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <Tabs.List>
              <Tabs.Trigger value="web">Web sessions</Tabs.Trigger>
              <Tabs.Trigger value="notebook">Notebook sessions</Tabs.Trigger>
              <Tabs.Trigger value="internal">Internal tokens</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="web">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <TokenHistoryView
                  username={user.username}
                  initialTokenType={mapTabTypeToTokenType('web')}
                  showFilters={true}
                />
              </div>
            </Tabs.Content>

            <Tabs.Content value="notebook">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <TokenHistoryView
                  username={user.username}
                  initialTokenType={mapTabTypeToTokenType('notebook')}
                  showFilters={true}
                />
              </div>
            </Tabs.Content>

            <Tabs.Content value="internal">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <TokenHistoryView
                  username={user.username}
                  initialTokenType={mapTabTypeToTokenType('internal')}
                  showFilters={true}
                />
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      )}
    </>
  );
};

SessionTokensHistoryPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  SessionTokensHistoryPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default SessionTokensHistoryPage;
