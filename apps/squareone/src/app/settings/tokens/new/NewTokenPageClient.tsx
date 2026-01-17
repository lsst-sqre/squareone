'use client';

import {
  extractTokenNames,
  useCreateToken,
  useLoginInfo,
  useUserTokens,
} from '@lsst-sqre/gafaelfawr-client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import AuthRequired from '../../../../components/AuthRequired';
import { TokenCreationErrorDisplay } from '../../../../components/TokenCreationErrorDisplay';
import {
  TokenForm,
  type TokenFormValues,
} from '../../../../components/TokenForm';
import TokenSuccessModal from '../../../../components/TokenSuccessModal';
import { Lede } from '../../../../components/Typography';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';
import useTokenTemplateUrl from '../../../../hooks/useTokenTemplateUrl';
import {
  calculateExpirationDate,
  parseExpirationFromQuery,
} from '../../../../lib/tokens/expiration';

export default function NewTokenPageClient() {
  return (
    <AuthRequired>
      <NewTokenContent />
    </AuthRequired>
  );
}

function NewTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repertoireUrl = useRepertoireUrl();

  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo(repertoireUrl);

  const {
    createToken,
    isCreating,
    error: creationError,
    reset,
  } = useCreateToken(repertoireUrl);

  const {
    tokens,
    error: tokensError,
    isLoading: tokensLoading,
    invalidate: invalidateTokens,
  } = useUserTokens(loginInfo?.username, repertoireUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [tokenFormValues, setTokenFormValues] =
    useState<TokenFormValues | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse query parameters for form prefilling
  const formInitialValues: Partial<TokenFormValues> = {};

  const nameParam = searchParams.get('name');
  if (nameParam) {
    formInitialValues.name = nameParam;
  }

  const scopesParam = searchParams.get('scopes');
  if (scopesParam) {
    formInitialValues.scopes = scopesParam.split(',').filter(Boolean);
  }

  const expirationParam = searchParams.get('expiration');
  if (expirationParam) {
    const parsedExpiration = parseExpirationFromQuery(expirationParam);
    if (parsedExpiration) {
      formInitialValues.expiration = parsedExpiration;
    }
  }

  const handleSubmit = async (values: TokenFormValues) => {
    if (!loginInfo) return;

    setIsSubmitting(true);
    reset();

    try {
      // Convert expiration to Date for the new API
      let expires: Date | null = null;
      if (values.expiration.type === 'preset') {
        expires = calculateExpirationDate(values.expiration.value);
      }

      const response = await createToken({
        username: loginInfo.username,
        tokenName: values.name,
        scopes: values.scopes,
        expires,
      });

      setCreatedToken(response.token);
      setTokenFormValues(values);
      setIsModalOpen(true);

      // Refresh the token list to include the newly created token
      invalidateTokens();
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

  let content: React.ReactNode;

  if (loginLoading || tokensLoading) {
    content = <p>Loading...</p>;
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
        <Lede>
          Create a new access token for programmatic access to Rubin Science
          Platform APIs.
        </Lede>

        {creationError && <TokenCreationErrorDisplay error={creationError} />}

        <TokenForm
          availableScopes={loginInfo.config.scopes.filter(
            (scope): scope is { name: string; description: string } =>
              scope.name !== undefined &&
              scope.description !== undefined &&
              loginInfo.scopes.includes(scope.name)
          )}
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
}
