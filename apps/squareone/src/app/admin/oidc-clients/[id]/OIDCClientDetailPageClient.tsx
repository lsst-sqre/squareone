'use client';

import {
  toGafaelfawrErrorInfo,
  useDeleteOidcClient,
  useOidcClient,
  useUpdateOidcClient,
} from '@lsst-sqre/gafaelfawr-client';
import {
  Button,
  ClipboardButton,
  ErrorMessage,
  KeyValueList,
  Note,
} from '@lsst-sqre/squared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import OIDCClientForm, {
  type OIDCClientFormValues,
} from '../../../../components/OIDCClientForm';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';
import {
  describeOidcClientFailure,
  OIDC_API_SCOPE,
} from '../../../../lib/oidc/clientErrors';
import { formatUtcTimestamp } from '../../../../lib/utils/dateFormatters';
import DeleteOIDCClientModal from './DeleteOIDCClientModal';
import styles from './OIDCClientDetailPageClient.module.css';

/** The listing this page hangs off, and where a delete returns to. */
const LANDING_URL = '/admin/oidc-clients';

/**
 * What a 404 means on the per-client routes: this client is gone, not that the
 * environment lacks an OpenID Connect server (which is the collection routes'
 * meaning of the same status).
 */
const CLIENT_GONE_MESSAGE =
  'This OpenID Connect client no longer exists. It may have been deleted by another administrator.';

export type OIDCClientDetailPageClientProps = {
  /** Client id from the `[id]` route segment, already URL-decoded by Next. */
  clientId: string;
};

/** Placeholder for a metadata field Gafaelfawr left null. */
const EMPTY_VALUE = '—';

/**
 * Client container for the `/admin/oidc-clients/[id]` detail page.
 *
 * Holds the whole of a client's lifecycle after creation: its server-assigned
 * metadata, an edit form, and deletion. Gafaelfawr has no endpoint to rotate a
 * client secret and never returns one after the create call, so — deliberately
 * — nothing here shows or offers a secret; the only remedy for a lost one is to
 * delete the client and register a replacement, which is what the delete
 * confirmation says.
 *
 * Editing reuses the same presentational {@link OIDCClientForm} the create page
 * does, in `edit` mode. Gafaelfawr's PATCH requires `return_uri` and
 * `description` on every call, so a save sends the client's complete updatable
 * state rather than a diff; the form's seeded values are what makes that
 * faithful. A failed save renders inline in the form with the operator's input
 * intact, so a 422 naming a field can be corrected in place.
 *
 * The load itself has three failure shapes worth distinguishing, following the
 * listing page: a 404 is a stale link (a graceful not-found with a way back,
 * and no retry that could ever succeed), a 403 is Gafaelfawr disagreeing with
 * the page gate that admitted the reader (so it names the scope the API wants),
 * and anything else may well work on a second try (so it gets a retry button).
 *
 * The page sits behind the `oidcClients` page-scope gate applied by `page.tsx`.
 */
export default function OIDCClientDetailPageClient({
  clientId,
}: OIDCClientDetailPageClientProps) {
  const router = useRouter();
  const repertoireUrl = useRepertoireUrl();

  const { updateOidcClient, isUpdating } = useUpdateOidcClient(repertoireUrl);
  const { deleteOidcClient, isDeleting } = useDeleteOidcClient(repertoireUrl);

  const [isSaved, setIsSaved] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Stop asking for a client that is on its way out. The delete mutation drops
  // the client's cache entry on success, and an observer still subscribed at
  // that moment refetches it straight into a 404 — a self-inflicted error
  // report for a delete that worked. Disabling the query from the moment the
  // request starts closes that window; the already-cached client stays on
  // screen behind the confirmation, and a *failed* delete re-enables it.
  const { client, isLoading, error, isNotFound, refetch } = useOidcClient(
    isDeleting || isDeleted ? undefined : clientId,
    repertoireUrl
  );

  const handleSubmit = async (values: OIDCClientFormValues) => {
    // A new attempt supersedes the last one's confirmation, so a stale "saved"
    // note can never sit above a failure.
    setIsSaved(false);
    try {
      await updateOidcClient(clientId, {
        return_uri: values.return_uri,
        description: values.description,
        // Explicitly null rather than omitted when the operator empties the
        // field. Unlike the create flow — where an absent key is simply "no
        // notes" — this PATCH replaces the client's whole updatable state, so
        // leaving the key out would make clearing the notes depend on whatever
        // the server defaults it to.
        notes: values.notes ?? null,
      });
      setIsSaved(true);
    } catch (submitError) {
      // Rethrown rather than swallowed: the form renders the message inline
      // and keeps the operator's input, which is what makes a 422 fixable.
      throw new Error(
        describeOidcClientFailure(submitError, {
          notFound: CLIENT_GONE_MESSAGE,
        })
      );
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteError(null);
    try {
      await deleteOidcClient(clientId);
      setIsDeleted(true);
      // The list is already invalidated by the mutation, so it renders without
      // the deleted client on arrival.
      router.push(LANDING_URL);
    } catch (caught) {
      setDeleteError(
        describeOidcClientFailure(caught, { notFound: CLIENT_GONE_MESSAGE })
      );
    }
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setDeleteError(null);
  };

  const backLink = (
    <p className={styles.backLink}>
      <Link href={LANDING_URL}>&larr; Back to OIDC clients</Link>
    </p>
  );

  // The client is gone and its cache entry with it, so every other branch below
  // would misreport that as a failure. This stands in for the moment between a
  // successful delete and the route transition landing on the listing.
  if (isDeleted) {
    return (
      <div>
        <h1>OIDC client</h1>
        <p className={styles.state}>
          Client deleted. Returning to the client list…
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <h1>OIDC client</h1>
        {backLink}
        <p className={styles.state}>Loading OpenID Connect client…</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div>
        <h1>OIDC client</h1>
        <Note type="warning">
          <h2 className={styles.errorHeading}>Client not found</h2>
          <p>{CLIENT_GONE_MESSAGE}</p>
        </Note>
        {backLink}
      </div>
    );
  }

  if (error || !client) {
    const isForbidden = !!error && toGafaelfawrErrorInfo(error).status === 403;

    return (
      <div>
        <h1>OIDC client</h1>
        {isForbidden ? (
          <Note type="warning">
            Gafaelfawr refused this request: your account does not hold the{' '}
            <code>{OIDC_API_SCOPE}</code> scope that the OpenID Connect client
            API requires. Contact your administrator to request it.
          </Note>
        ) : (
          <div className={styles.state}>
            <ErrorMessage
              strategy="dynamic"
              message="Failed to load this OpenID Connect client"
            />
            <p className={styles.errorDetail}>
              {error?.message ?? 'The client could not be loaded.'}
            </p>
            <Button
              appearance="outline"
              tone="secondary"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}
        {backLink}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {backLink}
      <h1>{client.description}</h1>

      <KeyValueList
        className={styles.metadata}
        items={[
          {
            key: 'Client ID',
            value: (
              <span className={styles.idRow}>
                <code className={styles.mono}>{client.client_id}</code>
                <ClipboardButton
                  text={client.client_id}
                  label="Copy"
                  successLabel="Copied!"
                  size="sm"
                  ariaLabel="Copy client ID to clipboard"
                  variant="secondary"
                />
              </span>
            ),
          },
          {
            key: 'URL',
            value: client.url ? (
              // The client application's own home page, so an ordinary anchor
              // rather than a `next/link` route transition.
              <a href={client.url} rel="noreferrer">
                {client.url}
              </a>
            ) : (
              EMPTY_VALUE
            ),
          },
          { key: 'Created', value: formatUtcTimestamp(client.created) },
          {
            key: 'Last modified',
            value: formatUtcTimestamp(client.last_modified),
          },
          { key: 'Last modified by', value: client.last_modified_by },
        ]}
      />

      <section className={styles.section}>
        <h2>Edit client</h2>
        {isSaved && (
          <Note type="tip">
            <p>
              Changes saved. The metadata above reflects this client&rsquo;s new
              state.
            </p>
          </Note>
        )}
        <OIDCClientForm
          mode="edit"
          defaultValues={{
            return_uri: client.return_uri,
            description: client.description,
            notes: client.notes ?? '',
          }}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
        />
      </section>

      <section className={styles.section}>
        <h2>Delete client</h2>
        <p>
          Deleting this client is permanent. Its secret cannot be recovered, so
          a replacement is a different client that every relying party has to be
          reconfigured for.
        </p>
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            setDeleteError(null);
            setIsDeleteModalOpen(true);
          }}
        >
          Delete client
        </Button>
      </section>

      <DeleteOIDCClientModal
        isOpen={isDeleteModalOpen}
        description={client.description}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
