import {
  Button,
  getLoginUrl,
  Tabs,
  useGafaelfawrUser,
} from '@lsst-sqre/squared';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import SessionTokensView from '@/components/SessionTokensView';
import { Lede } from '@/components/Typography';
import { getLayout } from '../../../components/SettingsLayout';
import { useAppConfig } from '../../../contexts/AppConfigContext';
import { loadAppConfig } from '../../../lib/config/loader';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

// biome-ignore lint/complexity/noBannedTypes: Empty props object required for Next.js page pattern
type SessionTokensPageProps = {
  // Add any page-specific props here
};

const SessionTokensPage: NextPageWithLayout &
  ((props: SessionTokensPageProps) => ReactElement) = () => {
  const appConfig = useAppConfig();
  const { user, isLoggedIn, isLoading } = useGafaelfawrUser();
  const router = useRouter();

  // Get active tab from URL query parameter, default to 'web'
  const activeTab = (router.query.type as string) || 'web';

  // Handle tab change by updating URL query parameter
  const handleTabChange = (value: string) => {
    router.push(`/settings/sessions?type=${value}`, undefined, {
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
          <title key="title">{`Sessions | ${appConfig.siteName}`}</title>
        </Head>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Sessions | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Manage your session tokens"
        />
        <meta property="og:title" key="ogtitle" content="Sessions" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Manage your session tokens"
        />
      </Head>

      <h1>Sessions</h1>
      <Lede>
        View and manage your web sessions, notebook sessions, and internal
        tokens.
      </Lede>

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
                <SessionTokensView
                  username={user.username}
                  tokenType="session"
                />
              </div>
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <Button
                  appearance="outline"
                  tone="secondary"
                  as={Link}
                  href="/settings/sessions/history?type=web"
                >
                  View history
                </Button>
              </div>
            </Tabs.Content>

            <Tabs.Content value="notebook">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <SessionTokensView
                  username={user.username}
                  tokenType="notebook"
                />
              </div>
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <Button
                  appearance="outline"
                  tone="secondary"
                  as={Link}
                  href="/settings/sessions/history?type=notebook"
                >
                  View history
                </Button>
              </div>
            </Tabs.Content>

            <Tabs.Content value="internal">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <SessionTokensView
                  username={user.username}
                  tokenType="internal"
                />
              </div>
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <Button
                  appearance="outline"
                  tone="secondary"
                  as={Link}
                  href="/settings/sessions/history?type=internal"
                >
                  View history
                </Button>
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      )}
    </>
  );
};

SessionTokensPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  SessionTokensPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default SessionTokensPage;
