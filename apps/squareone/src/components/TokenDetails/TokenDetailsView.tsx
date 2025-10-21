import React, { useState } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@lsst-sqre/squared';
import type { BadgeColor } from '@lsst-sqre/squared';
import useTokenDetails from '../../hooks/useTokenDetails';
import useDeleteToken from '../../hooks/useDeleteToken';
import {
  formatTokenExpiration,
  formatTokenCreated,
} from '../TokenDate/formatters';
import TokenDate from '../TokenDate';
import TokenHistoryView from '../TokenHistory/TokenHistoryView';
import DeleteTokenModal from '../AccessTokensView/DeleteTokenModal';
import styles from './TokenDetailsView.module.css';

function getScopeColor(scope: string): BadgeColor {
  if (scope.startsWith('exec:')) return 'red';
  if (scope.startsWith('read:')) return 'green';
  if (scope.startsWith('write:')) return 'yellow';
  return 'gray';
}

export type TokenDetailsViewProps = {
  username: string;
  tokenKey: string;
  onDeleteSuccess?: () => void;
  returnUrl?: string;
};

/**
 * Displays detailed information about a single token including:
 * - Token metadata (name, key, scopes, dates, parent)
 * - Delete functionality
 * - Change history for this token
 */
export default function TokenDetailsView({
  username,
  tokenKey,
  onDeleteSuccess,
  returnUrl = '/settings/tokens',
}: TokenDetailsViewProps) {
  const { token, error, isLoading } = useTokenDetails(username, tokenKey);
  const { deleteToken, isDeleting } = useDeleteToken();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteToken(username, tokenKey);
      setIsDeleteModalOpen(false);
      onDeleteSuccess?.();
    } catch (err) {
      console.error('Failed to delete token:', err);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading token details...</p>
      </div>
    );
  }

  // Error states
  if (error) {
    const is404 = error.message?.includes('404');

    if (is404) {
      // Token not found, but we can still show history
      return (
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Token Not Found</h2>
            <p>
              The token with key <code>{tokenKey}</code> no longer exists. It
              may have been deleted, expired, or revoked. However, the change
              history for this token is still available below.
            </p>
            <p>
              <strong>Token Key:</strong>{' '}
              <code className={styles.tokenKey}>{tokenKey}</code>
            </p>
          </div>

          {/* Change History Section */}
          <div className={styles.historySection}>
            <h2>Change History</h2>
            <TokenHistoryView
              username={username}
              token={tokenKey}
              showFilters={false}
            />
          </div>

          <p>
            <Link href={returnUrl}>Return to token list</Link>
          </p>
        </div>
      );
    }

    // Other errors
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error Loading Token</h2>
          <p>{error.message}</p>
          <p>
            <Link href={returnUrl}>Return to token list</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={styles.container}>
        <p>No token data available.</p>
      </div>
    );
  }

  const sortedScopes = [...token.scopes].sort();
  const expiration = formatTokenExpiration(token.expires);
  const created = formatTokenCreated(token.created);

  return (
    <div className={styles.container}>
      {/* Token Metadata Card */}
      <div className={styles.metadataCard}>
        <div className={styles.metadataHeader}>
          <h2 className={styles.tokenName}>
            {token.token_name || token.token}
          </h2>
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

        <div className={styles.metadataGrid}>
          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Token Key</dt>
            <dd className={styles.metadataValue}>
              <code className={styles.tokenKey}>{token.token}</code>
            </dd>
          </div>

          {token.token_type && token.token_type !== 'user' && (
            <div className={styles.metadataRow}>
              <dt className={styles.metadataLabel}>Type</dt>
              <dd className={styles.metadataValue}>{token.token_type}</dd>
            </div>
          )}

          {token.parent && (
            <div className={styles.metadataRow}>
              <dt className={styles.metadataLabel}>Parent Token</dt>
              <dd className={styles.metadataValue}>
                <Link
                  href={`/settings/tokens/${token.parent}`}
                  className={styles.link}
                >
                  <code className={styles.tokenKey}>{token.parent}</code>
                </Link>
              </dd>
            </div>
          )}

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Created</dt>
            <dd className={styles.metadataValue}>
              <TokenDate
                display={created.display}
                datetime={created.datetime}
              />
            </dd>
          </div>

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Expires</dt>
            <dd className={styles.metadataValue}>
              <TokenDate
                display={expiration.display}
                datetime={expiration.datetime}
              />
            </dd>
          </div>

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Scopes</dt>
            <dd className={styles.metadataValue}>
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
                <span>No scopes</span>
              )}
            </dd>
          </div>
        </div>
      </div>

      {/* Change History Section */}
      <div className={styles.historySection}>
        <h2>Change History</h2>
        <TokenHistoryView
          username={username}
          token={tokenKey}
          showFilters={false}
        />
      </div>

      {/* Delete Modal */}
      <DeleteTokenModal
        isOpen={isDeleteModalOpen}
        tokenName={token.token_name || token.token}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  );
}
