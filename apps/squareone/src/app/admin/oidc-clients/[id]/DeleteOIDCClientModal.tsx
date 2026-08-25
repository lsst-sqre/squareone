'use client';

import { Button, Modal, Note } from '@lsst-sqre/squared';
import React from 'react';

import styles from './DeleteOIDCClientModal.module.css';

export type DeleteOIDCClientModalProps = {
  /** Whether the confirmation is showing. */
  isOpen: boolean;
  /** The client's description, so the prompt names what is about to go. */
  description: string;
  /** Confirm the deletion. */
  onConfirm: () => void;
  /** Dismiss without deleting. */
  onCancel: () => void;
  /** Whether the deletion is in flight. */
  isDeleting: boolean;
  /**
   * A failed deletion, rendered inside the modal.
   *
   * Kept here rather than on the page behind it because the failure answers a
   * question the operator asked in this dialog: showing it in place lets them
   * retry or back out without re-deriving what they were doing.
   */
  error?: string | null;
};

/**
 * Confirmation dialog for deleting an OpenID Connect client.
 *
 * Modelled on {@link DeleteTokenModal}: an irreversible destructive action gets
 * a deliberate second step, the dialog cannot be dismissed while the request is
 * in flight, and the destructive button carries the `danger` variant.
 *
 * What differs is the stakes named in the copy. Deleting a client does not just
 * stop a credential working — Gafaelfawr never re-issues a client secret, so
 * the replacement is a *different* client that every relying party has to be
 * reconfigured for.
 *
 * Presentational: it neither knows how deletion happens nor what follows it.
 */
export default function DeleteOIDCClientModal({
  isOpen,
  description,
  onConfirm,
  onCancel,
  isDeleting,
  error = null,
}: DeleteOIDCClientModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onCancel();
    }
  };

  const handleInteractOutside = (event: Event) => {
    if (isDeleting) {
      event.preventDefault();
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Are you sure you want to delete this client?"
      description={`Anyone signing in through ${description} will stop being able to, and its client secret cannot be recovered — a replacement is a new client that every relying party must be reconfigured for. This action cannot be undone.`}
      size="small"
      closeButton={!isDeleting}
      onInteractOutside={handleInteractOutside}
    >
      {error && (
        <Note type="warning">
          <p>
            <strong>Failed to delete the client.</strong> {error}
          </p>
        </Note>
      )}

      <div className={styles.buttons}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete client
        </Button>
      </div>
    </Modal>
  );
}
