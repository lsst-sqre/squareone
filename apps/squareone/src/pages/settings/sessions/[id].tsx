import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { getLayout } from '../../../components/SettingsLayout';
import TokenDetailsView from '../../../components/TokenDetails';
import { useAppConfig } from '../../../contexts/AppConfigContext';
import useLoginInfo from '../../../hooks/useLoginInfo';
import { loadFooterMdx } from '../../../lib/config/footerLoader';
import { loadAppConfig } from '../../../lib/config/loader';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

const SessionTokenDetailsPage: NextPageWithLayout & (() => ReactElement) =
  () => {
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
            <title key="title">{`Invalid Session Token | ${appConfig.siteName}`}</title>
          </Head>
          <h1>Invalid Session Token ID</h1>
          <p>
            The session token ID in the URL is invalid. Please check the URL and
            try again.
          </p>
        </>
      );
    }

    // Loading state
    if (loginLoading) {
      return (
        <>
          <Head>
            <title key="title">{`Session Token Details | ${appConfig.siteName}`}</title>
          </Head>
          <h1>Session Token Details</h1>
          <p>Loading...</p>
        </>
      );
    }

    // Error state
    if (loginError || !loginInfo) {
      return (
        <>
          <Head>
            <title key="title">{`Session Token Details | ${appConfig.siteName}`}</title>
          </Head>
          <h1>Session Token Details</h1>
          <p>
            Failed to load authentication information. Please refresh the page
            or log in again.
          </p>
        </>
      );
    }

    const handleDeleteSuccess = () => {
      // Redirect to session tokens list after successful deletion
      router.push('/settings/sessions');
    };

    return (
      <>
        <Head>
          <title key="title">{`Session Token Details | ${appConfig.siteName}`}</title>
          <meta
            name="description"
            key="description"
            content="View details and change history for an RSP session token"
          />
          <meta
            property="og:title"
            key="ogtitle"
            content="Session Token Details"
          />
          <meta
            property="og:description"
            key="ogdescription"
            content="View session token details and change history"
          />
        </Head>

        <h1>Session Token Details</h1>
        <TokenDetailsView
          username={loginInfo.username}
          tokenKey={id}
          onDeleteSuccess={handleDeleteSuccess}
          returnUrl="/settings/sessions"
        />
      </>
    );
  };

SessionTokenDetailsPage.getLayout = getLayout;

// REQUIRED: Load appConfig for AppConfigProvider in _app.tsx
export const getServerSideProps: GetServerSideProps = async () => {
  const appConfig = await loadAppConfig();
  const footerMdxSource = await loadFooterMdx(appConfig);

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      footerMdxSource,
    },
  };
};

export default SessionTokenDetailsPage;
