import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type AccountPageProps = {
  // Add any page-specific props here
};

const AccountPage: NextPageWithLayout &
  ((props: AccountPageProps) => ReactElement) = () => {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Account Settings | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Manage your account settings and preferences"
        />
        <meta property="og:title" key="ogtitle" content="Account Settings" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Manage your account settings and preferences"
        />
      </Head>

      <h1>Account</h1>
      <p>
        Manage your account information, preferences, and personal settings.
        Update your profile details, change your display preferences, and
        configure your account security options.
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

AccountPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  AccountPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default AccountPage;
