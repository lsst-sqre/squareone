'use client';

import {
  useCreateServiceToken,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import { Note } from '@lsst-sqre/squared';
import React, { useState } from 'react';

import ServiceTokenForm, {
  type ServiceTokenFormValues,
} from '../../../components/ServiceTokenForm';
import { TokenCreationErrorDisplay } from '../../../components/TokenCreationErrorDisplay';
import TokenSuccessModal from '../../../components/TokenSuccessModal';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import { calculateExpirationDate } from '../../../lib/tokens/expiration';
import ManageServiceTokens from './ManageServiceTokens';

/**
 * Gafaelfawr scope required to create service tokens via the admin
 * `POST /auth/api/v1/tokens` endpoint.
 */
const TOKEN_ADMIN_SCOPE = 'admin:token';

/**
 * Client component for the `/admin/service-token` admin page.
 *
 * Renders the creation form (wired to {@link useCreateServiceToken}) and the
 * manage-existing-tokens section ({@link ManageServiceTokens}) for looking up and
 * revoking a bot user's service tokens.
 * The created token secret is revealed exactly once via {@link TokenSuccessModal},
 * and API errors surface through {@link TokenCreationErrorDisplay}. The page sits
 * behind the `exec:admin` gate inherited from the admin layout, and additionally
 * checks `loginInfo.scopes` for `admin:token` — without it, an explanatory banner
 * is shown and the form is disabled rather than letting a submit fail with a
 * silent 403.
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
    // The page stays inside the `exec:admin` admin section, but creating a
    // service token additionally requires the `admin:token` scope. When it is
    // absent we explain why and disable the form rather than letting a submit
    // fail with a silent 403.
    const hasAdminToken = loginInfo.scopes.includes(TOKEN_ADMIN_SCOPE);

    createContent = (
      <>
        {!hasAdminToken && (
          <Note type="warning">
            <p>
              You do not have the <code>{TOKEN_ADMIN_SCOPE}</code> scope, which
              is required to create service tokens. The form below is disabled.
              Ask an administrator to grant you the{' '}
              <code>{TOKEN_ADMIN_SCOPE}</code> scope.
            </p>
          </Note>
        )}
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
          disabled={!hasAdminToken}
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
        <ManageServiceTokens />
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
