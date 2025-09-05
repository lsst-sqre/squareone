import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type SessionsPageProps = {
  // Add any page-specific props here
};

const SessionsPage: NextPageWithLayout &
  ((props: SessionsPageProps) => ReactElement) = () => {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Sessions | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="View and manage your active login sessions and security settings"
        />
        <meta property="og:title" key="ogtitle" content="Sessions" />
        <meta
          property="og:description"
          key="ogdescription"
          content="View and manage your active login sessions and security settings"
        />
      </Head>

      <h1>Sessions</h1>
      <p>
        View and manage your active login sessions across different devices and
        browsers. You can revoke access for any session that you no longer
        recognize or need.
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

SessionsPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  SessionsPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default SessionsPage;
