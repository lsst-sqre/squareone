import type { OIDCClientWithSecret } from '@lsst-sqre/gafaelfawr-client';
import { ClipboardButton, Note } from '@lsst-sqre/squared';
import Link from 'next/link';
import React from 'react';

import styles from './OIDCClientCreated.module.css';

/** Base path for the admin OpenID Connect client routes. */
const OIDC_CLIENTS_BASE_HREF = '/admin/oidc-clients';

export type OIDCClientCreatedProps = {
  /**
   * The client Gafaelfawr just registered, including the secret it disclosed
   * with the 201. Held in the creating component's state only — never
   * persisted, and unavailable from any later request.
   */
  client: OIDCClientWithSecret;
  /** Override the base path of the client routes (defaults to the admin one). */
  baseHref?: string;
};

/** One labelled credential row: the value in mono, with a copy button. */
function CredentialRow({
  label,
  value,
  ariaLabel,
  emphasized = false,
}: {
  label: string;
  value: string;
  ariaLabel: string;
  emphasized?: boolean;
}) {
  return (
    <div className={styles.credential}>
      <span className={styles.credentialLabel}>{label}</span>
      <div className={emphasized ? styles.valueRowEmphasized : styles.valueRow}>
        <code className={styles.value}>{value}</code>
        <ClipboardButton
          text={value}
          label="Copy"
          successLabel="Copied!"
          size="md"
          ariaLabel={ariaLabel}
          className={styles.copyButton}
          variant="secondary"
        />
      </div>
    </div>
  );
}

/**
 * The one-shot confirmation shown after a client is registered.
 *
 * Modelled on {@link TokenSuccessModal}, but rendered in place of the form
 * rather than over it: Gafaelfawr returns `client_secret` only with the 201 and
 * offers no rotate endpoint, so a dismissable overlay would make it far too
 * easy to lose the secret with one stray click outside it. Replacing the form
 * means the only ways past this view are the two links out of it, both of them
 * deliberate.
 *
 * The secret lives in the creating component's React state and nowhere else —
 * not in the URL, not in storage — so it is gone on reload, which is why the
 * warning here is emphatic rather than decorative.
 *
 * Presentational: it takes the created client and renders it, with no
 * knowledge of how the creation happened.
 */
export default function OIDCClientCreated({
  client,
  baseHref = OIDC_CLIENTS_BASE_HREF,
}: OIDCClientCreatedProps) {
  const detailHref = `${baseHref}/${encodeURIComponent(client.client_id)}`;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        Registered{' '}
        <span className={styles.clientName}>{client.description}</span>
      </h2>

      <Note type="warning">
        <p>
          <strong>Copy the client secret now.</strong> This is the only time
          Gafaelfawr will show it — it cannot be read back later, and there is
          no way to rotate it. If you lose it, delete this client and register a
          new one.
        </p>
      </Note>

      <div className={styles.credentials}>
        <CredentialRow
          label="Client ID"
          value={client.client_id}
          ariaLabel="Copy client ID to clipboard"
        />
        <CredentialRow
          label="Client secret"
          value={client.client_secret}
          ariaLabel="Copy client secret to clipboard"
          emphasized
        />
      </div>

      <div className={styles.links}>
        <Link href={detailHref}>View this client</Link>
        <Link href={baseHref}>Back to all clients</Link>
      </div>
    </div>
  );
}
