import React from 'react';
import { Modal, ClipboardButton, Button } from '@lsst-sqre/squared';
import { useRouter } from 'next/router';
import { ExpirationValue } from '../../lib/tokens/expiration';
import styles from './TokenSuccessModal.module.css';

export type TokenSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  token: string;
  tokenName: string;
  scopes: string[];
  expiration: ExpirationValue;
  templateUrl: string;
};

export default function TokenSuccessModal({
  open,
  onClose,
  token,
  tokenName,
  scopes,
  expiration,
  templateUrl,
}: TokenSuccessModalProps) {
  const router = useRouter();

  const formatExpirationDate = (exp: ExpirationValue): string => {
    if (exp.type === 'never') {
      return 'Does not expire';
    }

    const days = parseInt(exp.value.replace('d', ''));
    const dateToFormat = new Date();
    dateToFormat.setDate(dateToFormat.getDate() + days);

    return `Expires on ${dateToFormat.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  const handleClose = () => {
    onClose();
    router.push('/settings/tokens');
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Your new access token"
      description="Copy your new access token now. It won't be displayed again."
      size="medium"
    >
      <div className={styles.content}>
        <div className={styles.tokenSection}>
          <div className={styles.tokenDisplay}>
            <code className={styles.tokenValue}>{token}</code>
            <ClipboardButton
              text={token}
              label="Copy"
              successLabel="Copied!"
              size="md"
              ariaLabel="Copy token to clipboard"
              className={styles.tokenCopyButton}
            />
          </div>
        </div>

        <p className={styles.warningText}>
          Copy this token. It won&apos;t be shown again. Treat this token like a
          password and do not share it.
        </p>

        <p className={styles.detailsText}>
          <em>
            Scopes: {scopes.join(', ')}. {formatExpirationDate(expiration)}.
          </em>
        </p>

        <div className={styles.actions}>
          <Button role="primary" onClick={handleClose}>
            Done
          </Button>
          <ClipboardButton
            role="secondary"
            text={templateUrl}
            label="Copy token template"
            successLabel="Template copied!"
            size="md"
            ariaLabel="Copy token template to clipboard"
            className={styles.templateCopyButton}
          />
        </div>
      </div>
    </Modal>
  );
}
