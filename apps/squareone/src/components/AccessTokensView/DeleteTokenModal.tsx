import { Button, Modal } from '@lsst-sqre/squared';
import React from 'react';
import styles from './DeleteTokenModal.module.css';

type DeleteTokenModalProps = {
  isOpen: boolean;
  tokenName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
};

export default function DeleteTokenModal({
  isOpen,
  tokenName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteTokenModalProps) {
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
      title="Are you sure you want to delete this token?"
      description={`Any applications using access token ${tokenName} will stop working until you provide a new token. This action cannot be undone.`}
      size="small"
      closeButton={!isDeleting}
      onInteractOutside={handleInteractOutside}
    >
      <div className={styles.buttons}>
        <Button type="button" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete token
        </Button>
      </div>
    </Modal>
  );
}
