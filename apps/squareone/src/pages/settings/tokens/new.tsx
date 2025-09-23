import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { getLayout } from '../../../components/SettingsLayout';
import { loadAppConfig } from '../../../lib/config/loader';
import { useAppConfig } from '../../../contexts/AppConfigContext';
import useLoginInfo, { type Scope } from '../../../hooks/useLoginInfo';
import { TokenForm, type TokenFormValues } from '../../../components/TokenForm';
import { parseTokenQueryParams } from '../../../lib/tokens/queryParams';
import { parseExpirationFromQuery } from '../../../lib/tokens/expiration';
import type { ParsedUrlQuery } from 'querystring';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactElement;
};

type NewTokenPageProps = {
  initialValues?: {
    name?: string;
    scopes?: string[];
    expiration?: string;
  };
};

const NewTokenPage: NextPageWithLayout &
  ((props: NewTokenPageProps) => ReactElement) = ({ initialValues }) => {
  const appConfig = useAppConfig();
  const router = useRouter();
  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepare form initial values
  const formInitialValues: Partial<TokenFormValues> = {};

  if (initialValues?.name) {
    formInitialValues.name = initialValues.name;
  }

  if (initialValues?.scopes && Array.isArray(initialValues.scopes)) {
    formInitialValues.scopes = initialValues.scopes;
  }

  if (initialValues?.expiration) {
    const parsedExpiration = parseExpirationFromQuery(initialValues.expiration);
    if (parsedExpiration) {
      formInitialValues.expiration = parsedExpiration;
    }
  }

  const handleSubmit = async (values: TokenFormValues) => {
    setIsSubmitting(true);
    try {
      // For Phase 1, just console.log the values
      console.log('Token creation form submitted:', values);

      // TODO: In Phase 2, implement actual token creation API call
      // For now, simulate success after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to tokens page on success
      router.push('/settings/tokens');
    } catch (error) {
      console.error('Token creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/settings/tokens');
  };

  let content;

  if (loginLoading) {
    content = <p>Loading…</p>;
  } else if (loginError || !loginInfo) {
    content = (
      <p>
        Failed to load authentication information. Please refresh the page or{' '}
        <Link href="/login">log in again</Link>.
      </p>
    );
  } else {
    content = (
      <>
        <p>
          Create a new access token for programmatic access to the Rubin Science
          Platform APIs. Access tokens allow you to authenticate with services
          without using your password.
        </p>

        <TokenForm
          availableScopes={loginInfo.config.scopes}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{`Create an RSP access token | ${appConfig.siteName}`}</title>
        <meta
          name="description"
          key="description"
          content="Create a new API access token for programmatic access to the Rubin Science Platform"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Create an RSP access token"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Create a new API access token for programmatic access"
        />
      </Head>

      <h1>Create an RSP access token</h1>
      {content}
    </>
  );
};

NewTokenPage.getLayout = getLayout;

// REQUIRED: Load appConfig and parse query parameters for form prefilling
export const getServerSideProps: GetServerSideProps<
  NewTokenPageProps
> = async ({ query }) => {
  const appConfig = await loadAppConfig();

  // Parse query parameters for form prefilling
  const queryParams = parseTokenQueryParams(query);

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      initialValues:
        Object.keys(queryParams).length > 0 ? queryParams : undefined,
    },
  };
};

export default NewTokenPage;
