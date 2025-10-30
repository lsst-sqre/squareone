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
import {
  parseExpirationFromQuery,
  formatExpiration,
} from '../../../lib/tokens/expiration';
import type { ParsedUrlQuery } from 'querystring';
import useTokenCreation from '../../../hooks/useTokenCreation';
import useTokenTemplateUrl from '../../../hooks/useTokenTemplateUrl';
import TokenSuccessModal from '../../../components/TokenSuccessModal';
import useUserTokens, { extractTokenNames } from '../../../hooks/useUserTokens';
import { TokenCreationErrorDisplay } from '../../../components/TokenCreationErrorDisplay';

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
  const {
    createToken,
    isCreating,
    error: creationError,
    reset,
  } = useTokenCreation();
  const {
    tokens,
    error: tokensError,
    isLoading: tokensLoading,
    mutate: mutateTokens,
  } = useUserTokens(loginInfo?.username);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [tokenFormValues, setTokenFormValues] =
    useState<TokenFormValues | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!loginInfo) return;

    setIsSubmitting(true);
    reset();

    try {
      const expires = formatExpiration(values.expiration);

      const response = await createToken({
        username: loginInfo.username,
        csrf: loginInfo.csrf,
        tokenName: values.name,
        scopes: values.scopes,
        expires,
      });

      setCreatedToken(response.token);
      setTokenFormValues(values);
      setIsModalOpen(true);

      // Refresh the token list to include the newly created token
      mutateTokens();
    } catch (error) {
      console.error('Token creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/settings/tokens');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCreatedToken(null);
    setTokenFormValues(null);
    router.push('/settings/tokens');
  };

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/settings/tokens/new`
      : '/settings/tokens/new';

  const templateUrl = useTokenTemplateUrl(
    baseUrl,
    tokenFormValues || { name: '', scopes: [], expiration: { type: 'never' } }
  );

  // Extract existing token names for validation
  const existingTokenNames = extractTokenNames(tokens);

  let content;

  if (loginLoading || tokensLoading) {
    content = <p>Loading…</p>;
  } else if (loginError || !loginInfo) {
    content = (
      <p>
        Failed to load authentication information. Please refresh the page or{' '}
        <Link href="/login">log in again</Link>.
      </p>
    );
  } else if (tokensError) {
    content = (
      <p>
        Failed to load existing tokens. Some validation features may not work
        properly.
      </p>
    );
  } else {
    content = (
      <>
        <p>
          Create a new access token for programmatic access to the Rubin Science
          Platform APIs.
        </p>

        {creationError && <TokenCreationErrorDisplay error={creationError} />}

        <TokenForm
          availableScopes={loginInfo.config.scopes}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting || isCreating}
          existingTokenNames={existingTokenNames}
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

      {createdToken && tokenFormValues && (
        <TokenSuccessModal
          open={isModalOpen}
          onClose={handleModalClose}
          token={createdToken}
          tokenName={tokenFormValues.name}
          scopes={tokenFormValues.scopes}
          expiration={tokenFormValues.expiration}
          templateUrl={templateUrl}
        />
      )}
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
