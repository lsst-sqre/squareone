import type { BadgeColor } from '@lsst-sqre/squared';
import { Badge, Button } from '@lsst-sqre/squared';
import Link from 'next/link';
import React, { useState } from 'react';
import useDeleteToken from '../../hooks/useDeleteToken';
import type { TokenInfo } from '../../hooks/useUserTokens';
import DeleteTokenModal from '../AccessTokensView/DeleteTokenModal';
import TokenDate from '../TokenDate';
import { formatTokenExpiration } from '../TokenDate/formatters';
import styles from './SessionTokenItem.module.css';

function getScopeColor(scope: string): BadgeColor {
  if (scope.startsWith('exec:')) return 'red';
  if (scope.startsWith('read:')) return 'green';
  if (scope.startsWith('write:')) return 'yellow';
  return 'gray';
}

type SessionTokenItemProps = {
  token: TokenInfo;
  username: string;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
};

export default function SessionTokenItem({
  token,
  username,
  onDeleteSuccess,
  onDeleteError,
}: SessionTokenItemProps) {
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

  const expiration = formatTokenExpiration(token.expires);

  return (
    <>
      <div className={styles.tokenItem}>
        <div className={styles.tokenItemInfoCell}>
          {token.token_name && (
            <div className={styles.tokenName}>{token.token_name}</div>
          )}
          <Link
            href={`/settings/sessions/${token.token}`}
            className={styles.tokenKey}
          >
            {token.token}
          </Link>
          {sortedScopes.length > 0 ? (
            <div className={styles.scopesBadges}>
              {sortedScopes.map((scope) => (
                <Badge
                  key={scope}
                  variant="soft"
                  color={getScopeColor(scope)}
                  radius="full"
                  size="sm"
                >
                  {scope}
                </Badge>
              ))}
            </div>
          ) : (
            <div className={styles.scopes}>No scopes.</div>
          )}
        </div>
        <div className={styles.tokenItemDatesCell}>
          <TokenDate
            className={styles.expiry}
            display={expiration.display}
            datetime={expiration.datetime}
          />
        </div>
        <div className={styles.tokenItemDeleteCell}>
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
