import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { Lede } from '@/components/Typography';
import { useGafaelfawrUser, getLoginUrl } from '@lsst-sqre/squared';
import QuotasView from '@/components/QuotasView';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type QuotasPageProps = {
  // Add any page-specific props here
};

const QuotasPage: NextPageWithLayout &
  ((props: QuotasPageProps) => ReactElement) = () => {
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
          <title key="title">{`Quotas | ${appConfig.siteName}`}</title>
        </Head>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Quotas | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Information about limits to your resource usage on the Rubin Science Platform"
        />
        <meta property="og:title" key="ogtitle" content="Quotas" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Information about limits to your resource usage on the Rubin Science Platform"
        />
      </Head>

      <h1>Quotas</h1>
      <Lede>
        Information about limits to your current resource usage on the Rubin
        Science Platform. These limits can change.
      </Lede>
      {user?.quota ? (
        <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
          <QuotasView quota={user.quota} />
        </div>
      ) : (
        <p>Not configured</p>
      )}
    </>
  );
};

QuotasPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  QuotasPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default QuotasPage;
