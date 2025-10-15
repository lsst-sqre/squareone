import React, { useState } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@lsst-sqre/squared';
import type { BadgeColor } from '@lsst-sqre/squared';
import type { TokenInfo } from '../../hooks/useUserTokens';
import useDeleteToken from '../../hooks/useDeleteToken';
import {
  formatTokenExpiration,
  formatTokenLastUsed,
} from '../TokenDate/formatters';
import DeleteTokenModal from './DeleteTokenModal';
import TokenDate from '../TokenDate';
import styles from './AccessTokenItem.module.css';

function getScopeColor(scope: string): BadgeColor {
  if (scope.startsWith('exec:')) return 'red';
  if (scope.startsWith('read:')) return 'green';
  if (scope.startsWith('write:')) return 'yellow';
  return 'gray';
}

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

  const expiration = formatTokenExpiration(token.expires);
  const lastUsed = formatTokenLastUsed(token.last_used);

  return (
    <>
      <div className={styles.tokenItem}>
        <div className={styles.tokenItemInfoCell}>
          <div className={styles.tokenName}>
            {token.token_name || token.token}
          </div>
          <Link
            href={`/settings/tokens/${token.token}`}
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
          <TokenDate
            className={styles.lastUsed}
            display={lastUsed.display}
            datetime={lastUsed.datetime}
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
