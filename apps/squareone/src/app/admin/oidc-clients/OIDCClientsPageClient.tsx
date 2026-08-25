'use client';

import {
  toGafaelfawrErrorInfo,
  useOidcClients,
} from '@lsst-sqre/gafaelfawr-client';
import { Button, ErrorMessage, Note } from '@lsst-sqre/squared';

import OIDCClientsTable from '../../../components/OIDCClientsTable';
import { Lede } from '../../../components/Typography';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import styles from './OIDCClientsPageClient.module.css';

/**
 * The scope Gafaelfawr itself requires on every OpenID Connect client
 * endpoint. Unlike the `adminPageScopes` mapping that decides who is offered
 * this page, this one is fixed by the API, so a 403 here can name it outright.
 */
const OIDC_API_SCOPE = 'admin:oidc';

/**
 * Client container for the `/admin/oidc-clients` listing page.
 *
 * Resolves Gafaelfawr through Repertoire service discovery (falling back to
 * `/auth/api/v1`) and lists the deployment's registered OpenID Connect
 * clients. The table itself is presentational
 * ({@link OIDCClientsTable}); what this component owns is deciding *which*
 * answer the listing produced, because Gafaelfawr's failures here are not
 * interchangeable:
 *
 * - **404** means this environment has no OpenID Connect server at all. That
 *   is a deployment fact, not a fault, so it renders as an informational note
 *   rather than an error — and without a retry, which would never succeed.
 * - **403** means Gafaelfawr disagrees with the `adminPageScopes` mapping that
 *   let the reader through the page gate. Also not retryable, so it names the
 *   scope the API wants instead.
 * - Anything else — a 5xx, a network failure — may well succeed on a second
 *   try, so it gets the message and a retry button.
 *
 * The page sits behind the `oidcClients` page-scope gate applied by `page.tsx`.
 */
export default function OIDCClientsPageClient() {
  const repertoireUrl = useRepertoireUrl();
  const { clients, isLoading, error, isNotConfigured, refetch } =
    useOidcClients(repertoireUrl);

  let body: React.ReactNode;
  if (isLoading) {
    body = <div className={styles.state}>Loading OpenID Connect clients…</div>;
  } else if (isNotConfigured) {
    body = (
      <Note type="info">
        The OpenID Connect server is not configured in this environment, so
        there are no clients to manage here. Ask your Phalanx administrator to
        enable Gafaelfawr&rsquo;s OpenID Connect server if you need one.
      </Note>
    );
  } else if (error && toGafaelfawrErrorInfo(error).status === 403) {
    body = (
      <Note type="warning">
        Gafaelfawr refused this request: your account does not hold the{' '}
        <code>{OIDC_API_SCOPE}</code> scope that the OpenID Connect client API
        requires. Contact your administrator to request it.
      </Note>
    );
  } else if (error) {
    body = (
      <div className={styles.state}>
        <ErrorMessage
          strategy="dynamic"
          message="Failed to load OpenID Connect clients"
        />
        <p className={styles.errorDetail}>{error.message}</p>
        <Button
          appearance="outline"
          tone="secondary"
          size="sm"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  } else {
    body = <OIDCClientsTable clients={clients ?? []} />;
  }

  return (
    <div>
      <h1>OIDC clients</h1>
      <Lede>
        OpenID Connect clients let applications outside the Rubin Science
        Platform authenticate their users against Gafaelfawr.
      </Lede>
      <p>
        Each client registers a return URI that Gafaelfawr will redirect to
        after a successful login. A client&rsquo;s secret is shown only once,
        when it is created, so store it before leaving that page.
      </p>

      {body}
    </div>
  );
}
