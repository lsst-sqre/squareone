'use client';

import {
  useCreateServiceToken,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import { Note } from '@lsst-sqre/squared';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import ServiceTokenForm, {
  type ServiceTokenFormInitialValues,
  type ServiceTokenFormValues,
} from '../../../../components/ServiceTokenForm';
import { TokenCreationErrorDisplay } from '../../../../components/TokenCreationErrorDisplay';
import TokenSuccessModal from '../../../../components/TokenSuccessModal';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';
import {
  calculateExpirationDate,
  parseExpirationFromQuery,
} from '../../../../lib/tokens/expiration';

/**
 * Gafaelfawr scope required to create service tokens via the admin
 * `POST /auth/api/v1/tokens` endpoint.
 */
const TOKEN_ADMIN_SCOPE = 'admin:token';

/**
 * Where to return after a successful creation or a cancel. Mirrors the
 * `/settings/tokens/new` → `/settings/tokens` relationship.
 */
const LANDING_URL = '/admin/service-tokens';

/**
 * Client component for the `/admin/service-tokens/new` admin page.
 *
 * Renders the service-token creation form (wired to {@link useCreateServiceToken})
 * and reveals the new token secret exactly once via {@link TokenSuccessModal};
 * closing the modal (or cancelling the form) returns to the service-tokens
 * landing page. API errors surface through {@link TokenCreationErrorDisplay}.
 *
 * The page sits behind the `exec:admin` gate inherited from the admin layout, and
 * additionally checks `loginInfo.scopes` for `admin:token` — without it, an
 * explanatory banner is shown and the form is disabled rather than letting a
 * submit fail with a silent 403.
 */
export default function NewServiceTokenPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Parse query parameters for form prefilling, mirroring `/settings/tokens/new`
  // and extending it to the Advanced-settings metadata fields. Only the params
  // actually present populate fields; omitted ones keep the form's defaults, and
  // an unparseable expiration is ignored (falls back to the "never" default).
  const formInitialValues: ServiceTokenFormInitialValues = {};

  const usernameParam = searchParams.get('username');
  if (usernameParam) {
    formInitialValues.username = usernameParam;
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

  // The Advanced-settings inputs are raw strings, so each metadata param is
  // passed through verbatim — uid/gid as their string text and groups split from
  // the comma-separated query list into the textarea's one-per-line format.
  const metadata: NonNullable<ServiceTokenFormInitialValues['metadata']> = {};

  const nameParam = searchParams.get('name');
  if (nameParam) {
    metadata.name = nameParam;
  }

  const emailParam = searchParams.get('email');
  if (emailParam) {
    metadata.email = emailParam;
  }

  const uidParam = searchParams.get('uid');
  if (uidParam) {
    metadata.uid = uidParam;
  }

  const gidParam = searchParams.get('gid');
  if (gidParam) {
    metadata.gid = gidParam;
  }

  const groupsParam = searchParams.get('groups');
  if (groupsParam) {
    metadata.groups = groupsParam.split(',').filter(Boolean).join('\n');
  }

  if (Object.keys(metadata).length > 0) {
    formInitialValues.metadata = metadata;
  }

  const handleSubmit = async (values: ServiceTokenFormValues) => {
    reset();

    let expires: Date | null = null;
    if (values.expiration.type === 'preset') {
      expires = calculateExpirationDate(values.expiration.value);
    }

    const response = await createServiceToken({
      username: values.username,
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

  const handleCancel = () => {
    router.push(LANDING_URL);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCreatedToken(null);
    setSubmittedValues(null);
  };

  let content: React.ReactNode;
  if (loginLoading) {
    content = <p>Loading…</p>;
  } else if (loginError || !loginInfo) {
    content = (
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

    content = (
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
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isCreating}
          disabled={!hasAdminToken}
        />
      </>
    );
  }

  return (
    <div>
      <h1>Create a service token</h1>
      <p>
        Create a Gafaelfawr service token for a <code>bot-</code> user. Choose
        the scopes the token should carry; an <code>admin:token</code> holder
        may grant any configured scope. Optionally set an expiration and
        identity metadata under Advanced settings. The token secret is revealed
        only once after creation.
      </p>

      {content}

      {createdToken && submittedValues && (
        <TokenSuccessModal
          open={isModalOpen}
          onClose={handleModalClose}
          token={createdToken}
          scopes={submittedValues.scopes}
          expiration={submittedValues.expiration}
          redirectUrl={LANDING_URL}
        />
      )}
    </div>
  );
}
