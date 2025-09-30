import React, { useState } from 'react';
import { Button } from '@lsst-sqre/squared';
import type { TokenInfo } from '../../hooks/useUserTokens';
import useDeleteToken from '../../hooks/useDeleteToken';
import {
  formatExpiration,
  formatLastUsed,
} from '../../lib/utils/dateFormatters';
import DeleteTokenModal from './DeleteTokenModal';
import styles from './AccessTokenItem.module.css';

type AccessTokenItemProps = {
  token: TokenInfo;
  username: string;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
};

export default function AccessTokenItem({
  token,
  username,
  onDeleteSuccess,
  onDeleteError,
}: AccessTokenItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deleteToken, isDeleting, error } = useDeleteToken();

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await deleteToken(username, token.token);
      setIsModalOpen(false);
      onDeleteSuccess?.();
    } catch (err) {
      setIsModalOpen(false);
      onDeleteError?.(err as Error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const sortedScopes = [...token.scopes].sort();
  const scopesContent =
    sortedScopes.length > 0 ? sortedScopes.join(', ') : 'No scopes.';

  return (
    <>
      <div className={styles.tokenItem}>
        <div className={styles.tokenItemInfoCell}>
          <div className={styles.tokenName}>{token.token_name}</div>
          <div className={styles.tokenKey}>{token.token}</div>
          <div className={styles.scopes}>{scopesContent}</div>
        </div>
        <div className={styles.tokenItemDatesCell}>
          <div className={styles.expiry}>{formatExpiration(token.expires)}</div>
          <div className={styles.lastUsed}>
            {formatLastUsed(token.last_used)}
          </div>
        </div>
        <div className={styles.tokenItemDeleteCell}>
          <div className={styles.deleteButton}>
            <Button
              type="button"
              tone="danger"
              appearance="outline"
              size="md"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </div>
        </div>
        {error && (
          <div className={styles.tokenItemErrorCell}>
            <div className={styles.error}>{error.message}</div>
          </div>
        )}
      </div>

      <DeleteTokenModal
        isOpen={isModalOpen}
        tokenName={token.token_name || token.token}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isDeleting={isDeleting}
      />
    </>
  );
}
