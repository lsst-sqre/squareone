'use client';

import {
  useCreateServiceToken,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import React, { useState } from 'react';

import ServiceTokenForm, {
  type ServiceTokenFormValues,
} from '../../../components/ServiceTokenForm';
import { TokenCreationErrorDisplay } from '../../../components/TokenCreationErrorDisplay';
import TokenSuccessModal from '../../../components/TokenSuccessModal';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import { calculateExpirationDate } from '../../../lib/tokens/expiration';

/**
 * Client component for the `/admin/service-token` admin page.
 *
 * Renders the creation form (wired to {@link useCreateServiceToken}) and keeps a
 * placeholder for the manage-existing-tokens section (filled in by a later task).
 * The created token secret is revealed exactly once via {@link TokenSuccessModal},
 * and API errors surface through {@link TokenCreationErrorDisplay}. The page sits
 * behind the `exec:admin` gate inherited from the admin layout.
 */
export default function ServiceTokenPageClient() {
  const repertoireUrl = useRepertoireUrl();

  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo(repertoireUrl);

  const {
    createServiceToken,
    isCreating,
    error: creationError,
    reset,
  } = useCreateServiceToken(repertoireUrl);

  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [submittedValues, setSubmittedValues] =
    useState<ServiceTokenFormValues | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (values: ServiceTokenFormValues) => {
    reset();

    let expires: Date | null = null;
    if (values.expiration.type === 'preset') {
      expires = calculateExpirationDate(values.expiration.value);
    }

    const response = await createServiceToken({
      username: values.username,
      tokenName: values.name,
      scopes: values.scopes,
      expires,
      // Only the metadata fields the operator supplied are present, so omitted
      // fields stay absent from the request body.
      ...values.metadata,
    });

    setCreatedToken(response.token);
    setSubmittedValues(values);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCreatedToken(null);
    setSubmittedValues(null);
  };

  let createContent: React.ReactNode;
  if (loginLoading) {
    createContent = <p>Loading…</p>;
  } else if (loginError || !loginInfo) {
    createContent = (
      <p>
        Failed to load authentication information. Please refresh the page or
        log in again.
      </p>
    );
  } else {
    createContent = (
      <>
        {creationError && <TokenCreationErrorDisplay error={creationError} />}
        <ServiceTokenForm
          // The full configured scope list (not filtered to the admin's own
          // scopes): an `admin:token` holder can grant any scope to a service
          // token. Malformed entries with missing name/description are dropped.
          availableScopes={loginInfo.config.scopes.filter(
            (scope): scope is { name: string; description: string } =>
              scope.name !== undefined && scope.description !== undefined
          )}
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
        />
      </>
    );
  }

  return (
    <div>
      <h1>Service tokens</h1>
      <p>
        Create and manage Gafaelfawr service tokens for <code>bot-</code> users.
      </p>

      <section>
        <h2>Create a service token</h2>
        {createContent}
      </section>

      <section>
        <h2>Manage existing tokens</h2>
        <p>
          Look up and revoke an existing bot user&rsquo;s service tokens here.
        </p>
      </section>

      {createdToken && submittedValues && (
        <TokenSuccessModal
          open={isModalOpen}
          onClose={handleModalClose}
          token={createdToken}
          tokenName={submittedValues.name}
          scopes={submittedValues.scopes}
          expiration={submittedValues.expiration}
          redirectUrl={null}
        />
      )}
    </div>
  );
}
