import React, { useRef, useEffect } from 'react';
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
  const tokenCopyButtonRef = useRef<HTMLButtonElement>(null);

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

  // Focus the token copy button when the modal opens
  useEffect(() => {
    if (open && tokenCopyButtonRef.current) {
      // Use a small delay to ensure the modal is fully rendered and visible
      const timeoutId = setTimeout(() => {
        tokenCopyButtonRef.current?.focus();
      }, 150);

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      onInteractOutside={(event: Event) => event.preventDefault()}
      title="Your new access token"
      description="Copy this token. It won't be shown again. Treat this token like a password and do not share it."
      size="medium"
    >
      <div className={styles.content}>
        <div className={styles.tokenSection}>
          <div className={styles.tokenDisplay}>
            <code className={styles.tokenValue}>{token}</code>
            <ClipboardButton
              ref={tokenCopyButtonRef}
              text={token}
              label="Copy"
              successLabel="Copied!"
              size="md"
              ariaLabel="Copy token to clipboard"
              className={styles.tokenCopyButton}
            />
          </div>
        </div>

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
            successLabel="Template URL copied!"
            size="md"
            ariaLabel="Copy token template to clipboard"
            className={styles.templateCopyButton}
          />
        </div>
      </div>
    </Modal>
  );
}
