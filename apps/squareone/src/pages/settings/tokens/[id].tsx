import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getLayout } from '../../../components/SettingsLayout';
import { loadAppConfig } from '../../../lib/config/loader';
import { useAppConfig } from '../../../contexts/AppConfigContext';
import useLoginInfo from '../../../hooks/useLoginInfo';
import TokenDetailsView from '../../../components/TokenDetails';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

const TokenDetailsPage: NextPageWithLayout & (() => ReactElement) = () => {
  const appConfig = useAppConfig();
  const router = useRouter();
  const { id } = router.query;
  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo();

  // Handle invalid token ID
  if (!id || typeof id !== 'string') {
    return (
      <>
        <Head>
          <title key="title">{`Invalid Token | ${appConfig.siteName}`}</title>
        </Head>
        <h1>Invalid Token ID</h1>
        <p>
          The token ID in the URL is invalid. Please check the URL and try
          again.
        </p>
      </>
    );
  }

  // Loading state
  if (loginLoading) {
    return (
      <>
        <Head>
          <title key="title">{`Token Details | ${appConfig.siteName}`}</title>
        </Head>
        <h1>Token Details</h1>
        <p>Loading...</p>
      </>
    );
  }

  // Error state
  if (loginError || !loginInfo) {
    return (
      <>
        <Head>
          <title key="title">{`Token Details | ${appConfig.siteName}`}</title>
        </Head>
        <h1>Token Details</h1>
        <p>
          Failed to load authentication information. Please refresh the page or
          log in again.
        </p>
      </>
    );
  }

  const handleDeleteSuccess = () => {
    // Redirect to token list after successful deletion
    router.push('/settings/tokens');
  };

  return (
    <>
      <Head>
        <title key="title">{`Token Details | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="View details and change history for an RSP access token"
        />
        <meta property="og:title" key="ogtitle" content="Token Details" />
        <meta
          property="og:description"
          key="ogdescription"
          content="View token details and change history"
        />
      </Head>

      <h1>Token Details</h1>
      <TokenDetailsView
        username={loginInfo.username}
        tokenKey={id}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

TokenDetailsPage.getLayout = getLayout;

// REQUIRED: Load appConfig for AppConfigProvider in _app.tsx
export const getServerSideProps: GetServerSideProps = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
    },
  };
};

export default TokenDetailsPage;
