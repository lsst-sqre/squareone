import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import type { BadgeColor } from '@lsst-sqre/squared';
import { Badge, Button } from '@lsst-sqre/squared';
import Link from 'next/link';
import { useState } from 'react';
import DeleteTokenModal from '../AccessTokensView/DeleteTokenModal';
import TokenDate from '../TokenDate';
import {
  formatTokenCreated,
  formatTokenExpiration,
} from '../TokenDate/formatters';
import styles from './TokenDetailsView.module.css';

function getScopeColor(scope: string): BadgeColor {
  if (scope.startsWith('exec:')) return 'red';
  if (scope.startsWith('read:')) return 'green';
  if (scope.startsWith('write:')) return 'yellow';
  return 'gray';
}

export default {
  title: 'Components/TokenDetails/TokenDetailsView',
  parameters: {
    layout: 'padded',
  },
};

const now = Math.floor(Date.now() / 1000);

const mockToken: TokenInfo = {
  username: 'testuser',
  token_type: 'user',
  service: null,
  scopes: ['read:tap', 'exec:notebook', 'write:tap'],
  created: now - 86400 * 30,
  expires: now + 86400 * 30,
  token: 'abc123xyz456789012345',
  token_name: 'My Laptop Token',
  parent: null,
};

const mockTokenWithParent: TokenInfo = {
  ...mockToken,
  token: 'def456abc789012345678',
  token_name: 'Child Token',
  parent: 'abc123xyz456789012345',
  scopes: ['read:tap'],
};

const mockSessionToken: TokenInfo = {
  ...mockToken,
  token: 'session123456789012345',
  token_type: 'session',
  token_name: undefined,
  scopes: ['read:all', 'exec:notebook'],
};

const mockExpiredToken: TokenInfo = {
  ...mockToken,
  token: 'expired12345678901234',
  token_name: 'Expired Token',
  expires: now - 86400,
};

// Wrapper component for stories that doesn't use hooks
type TokenDetailsViewWrapperProps = {
  token?: TokenInfo;
  isLoading?: boolean;
  error?: Error;
  tokenKey: string;
};

function TokenDetailsViewWrapper({
  token,
  isLoading = false,
  error,
  tokenKey,
}: TokenDetailsViewWrapperProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);
    console.log('Token deleted');
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
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {is404 ? (
            <>
              <h2>Token Not Found</h2>
              <p>
                The token with key <code>{tokenKey}</code> could not be found.
                It may have been deleted or you may not have permission to view
                it.
              </p>
              <p>
                <Link href="/settings/tokens">Return to token list</Link>
              </p>
            </>
          ) : (
            <>
              <h2>Error Loading Token</h2>
              <p>{error.message}</p>
              <p>
                <Link href="/settings/tokens">Return to token list</Link>
              </p>
            </>
          )}
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
            <dt className={styles.metadataLabel}>Token key</dt>
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
        <p style={{ color: 'var(--rsd-color-gray-500)' }}>
          Token history view would appear here (mocked for Storybook)
        </p>
      </div>

      {/* Delete Modal */}
      <DeleteTokenModal
        isOpen={isDeleteModalOpen}
        tokenName={token.token_name || token.token}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={false}
      />
    </div>
  );
}

export const Default = {
  render: () => (
    <TokenDetailsViewWrapper token={mockToken} tokenKey={mockToken.token} />
  ),
};

export const WithParent = {
  render: () => (
    <TokenDetailsViewWrapper
      token={mockTokenWithParent}
      tokenKey={mockTokenWithParent.token}
    />
  ),
};

export const SessionToken = {
  render: () => (
    <TokenDetailsViewWrapper
      token={mockSessionToken}
      tokenKey={mockSessionToken.token}
    />
  ),
};

export const ExpiredToken = {
  render: () => (
    <TokenDetailsViewWrapper
      token={mockExpiredToken}
      tokenKey={mockExpiredToken.token}
    />
  ),
};

export const Loading = {
  render: () => (
    <TokenDetailsViewWrapper
      isLoading={true}
      tokenKey="abc123xyz456789012345"
    />
  ),
};

export const NotFound = {
  render: () => (
    <TokenDetailsViewWrapper
      error={new Error('HTTP 404: Not Found')}
      tokenKey="notfound12345678901234"
    />
  ),
};

export const NetworkError = {
  render: () => (
    <TokenDetailsViewWrapper
      error={new Error('Network error')}
      tokenKey="error123456789012345"
    />
  ),
};
