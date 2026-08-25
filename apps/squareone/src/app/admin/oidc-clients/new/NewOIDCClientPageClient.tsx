'use client';

import type { OIDCClientWithSecret } from '@lsst-sqre/gafaelfawr-client';
import {
  toGafaelfawrErrorInfo,
  useCreateOidcClient,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import { Note } from '@lsst-sqre/squared';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import OIDCClientCreated from '../../../../components/OIDCClientCreated';
import OIDCClientForm, {
  type OIDCClientFormValues,
} from '../../../../components/OIDCClientForm';
import ScopeList from '../../../../components/ScopeList';
import { Lede } from '../../../../components/Typography';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../../../hooks/useStaticConfig';
import {
  getRequiredAdminScopes,
  hasAdminPageAccess,
} from '../../../../lib/config/adminPageScopes';

/** Where Cancel returns to. */
const LANDING_URL = '/admin/oidc-clients';

/**
 * The scope Gafaelfawr itself requires on every OpenID Connect client
 * endpoint. Unlike the `adminPageScopes` mapping that decides who is offered
 * this page, this one is fixed by the API, so a 403 here can name it outright.
 */
const OIDC_API_SCOPE = 'admin:oidc';

/**
 * Turn a failed creation into the sentence the form should show inline.
 *
 * Most failures — a 422 above all, the common one here — already carry
 * Gafaelfawr's own `ErrorModel` detail, which names the offending field and is
 * far more useful than anything this page could invent, so those pass through
 * verbatim. The two exceptions are the statuses whose bare message says
 * nothing actionable: a 403 is really "you are missing a scope", and a 404 on
 * this endpoint means the environment has no OpenID Connect server at all.
 */
function describeCreateFailure(error: unknown): string {
  const { status, message } = toGafaelfawrErrorInfo(error);

  if (status === 403) {
    return `Gafaelfawr refused this request: your account does not hold the ${OIDC_API_SCOPE} scope that the OpenID Connect client API requires. Contact your administrator to request it.`;
  }

  if (status === 404) {
    return 'The OpenID Connect server is not configured in this environment, so clients cannot be registered here. Ask your Phalanx administrator to enable it.';
  }

  return message;
}

/**
 * Client component for the `/admin/oidc-clients/new` page.
 *
 * Wires the presentational {@link OIDCClientForm} to
 * {@link useCreateOidcClient}, which resolves Gafaelfawr through Repertoire
 * discovery and sources the `x-csrf-token` mutations need from
 * {@link useLoginInfo}. On success the form is *replaced* by
 * {@link OIDCClientCreated}, which shows `client_id` and the one-time
 * `client_secret`; that secret lives in this component's state and nowhere
 * else, so it is gone the moment the operator navigates away or reloads —
 * which is exactly Gafaelfawr's contract, since it is never returned again.
 *
 * The page gates itself on the `oidcClients` page scopes (see `page.tsx`), and
 * the form re-checks the same configured scopes against `loginInfo.scopes` —
 * without them an explanatory `Note` is shown and the form is disabled rather
 * than letting a submit fail with a silent 403.
 *
 * A failed create is rendered inline by the form with the operator's input
 * intact, so a 422 naming a field can be corrected in place.
 */
export default function NewOIDCClientPageClient() {
  const router = useRouter();
  const repertoireUrl = useRepertoireUrl();
  const config = useStaticConfig();

  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo(repertoireUrl);

  const { createOidcClient, isCreating } = useCreateOidcClient(repertoireUrl);

  const [createdClient, setCreatedClient] =
    useState<OIDCClientWithSecret | null>(null);

  const handleSubmit = async (values: OIDCClientFormValues) => {
    try {
      const created = await createOidcClient({
        return_uri: values.return_uri,
        description: values.description,
        // Only include notes when the operator supplied them, so an untouched
        // field stays absent from the request body rather than writing "".
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
      });
      setCreatedClient(created);
    } catch (error) {
      // Rethrown rather than swallowed: the form renders the message inline
      // and keeps the operator's input, which is what makes a 422 fixable.
      throw new Error(describeCreateFailure(error));
    }
  };

  const handleCancel = () => {
    router.push(LANDING_URL);
  };

  let content: React.ReactNode;
  if (createdClient) {
    content = <OIDCClientCreated client={createdClient} />;
  } else if (loginLoading) {
    content = <p>Loading…</p>;
  } else if (loginError || !loginInfo) {
    content = (
      <p>
        Failed to load authentication information. Please refresh the page or
        log in again.
      </p>
    );
  } else {
    // Which scope Gafaelfawr's OIDC client API requires is configured per
    // deployment (`adminPageScopes.oidcClients`), so the form asks the same
    // question the page's gate does rather than hard-coding `admin:oidc`.
    // Reaching this page already implies the scope; the check stays because it
    // is what keeps the form from ever mounting in a state whose submit would
    // 403, whatever gate sits above it.
    const hasOidcAdmin = hasAdminPageAccess(
      config,
      loginInfo.scopes,
      'oidcClients'
    );
    const requiredScopes = getRequiredAdminScopes(config, 'oidcClients');

    content = (
      <>
        {!hasOidcAdmin && (
          <Note type="warning">
            <p>
              You do not have <ScopeList scopes={requiredScopes} />, which is
              required to register OpenID Connect clients. The form below is
              disabled. Ask an administrator to grant you{' '}
              {requiredScopes.length > 1 ? 'one of those scopes' : 'that scope'}
              .
            </p>
          </Note>
        )}
        <OIDCClientForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isCreating}
          disabled={!hasOidcAdmin}
        />
      </>
    );
  }

  return (
    <div>
      <h1>Register an OpenID Connect client</h1>
      {!createdClient && (
        <Lede>
          Register an application outside the Rubin Science Platform so it can
          authenticate its users against Gafaelfawr.
        </Lede>
      )}

      {content}
    </div>
  );
}
