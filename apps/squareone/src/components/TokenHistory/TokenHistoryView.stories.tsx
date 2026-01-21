import type { TokenChangeHistoryEntry } from '@lsst-sqre/gafaelfawr-client';
import { useState } from 'react';

import TokenHistoryFilters from './TokenHistoryFilters';
import TokenHistoryList from './TokenHistoryList';
import styles from './TokenHistoryView.module.css';

export default {
  title: 'Components/TokenHistory/TokenHistoryView',
  parameters: {
    layout: 'padded',
  },
};

// Mock data
const now = Math.floor(Date.now() / 1000);

const mockEntries: TokenChangeHistoryEntry[] = [
  {
    token: 'abc123xyz456789012345',
    username: 'testuser',
    token_type: 'user',
    token_name: 'My Laptop Token',
    parent: null,
    scopes: ['read:tap', 'exec:notebook'],
    service: null,
    expires: now + 86400 * 30,
    actor: 'testuser',
    action: 'create',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '192.168.1.1',
    event_time: now - 7200,
  },
  {
    token: 'abc123xyz456789012345',
    username: 'testuser',
    token_type: 'user',
    token_name: 'My Laptop Token',
    parent: null,
    scopes: ['read:tap', 'exec:notebook', 'write:tap'],
    service: null,
    expires: now + 86400 * 45,
    actor: 'testuser',
    action: 'edit',
    old_token_name: 'My Laptop Token',
    old_scopes: ['read:tap', 'exec:notebook'],
    old_expires: now + 86400 * 30,
    ip_address: '192.168.1.1',
    event_time: now - 86400,
  },
  {
    token: 'def456abc789012345678',
    username: 'testuser',
    token_type: 'user',
    token_name: 'Test Token',
    parent: 'abc123xyz456789012345',
    scopes: ['read:tap'],
    service: null,
    expires: now + 86400 * 7,
    actor: 'testuser',
    action: 'create',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '10.0.0.1',
    event_time: now - 86400 * 3,
  },
  {
    token: 'ghi789jkl012345678901',
    username: 'testuser',
    token_type: 'user',
    token_name: 'Old Token',
    parent: null,
    scopes: ['read:image'],
    service: null,
    expires: now - 86400,
    actor: 'system',
    action: 'expire',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: null,
    event_time: now - 86400,
  },
];

// Wrapper component for stories that doesn't use hooks
type TokenHistoryViewWrapperProps = {
  entries: TokenChangeHistoryEntry[];
  showFilters?: boolean;
  isLoading?: boolean;
  error?: Error;
  hasMore?: boolean;
  totalCount?: number;
};

function TokenHistoryViewWrapper({
  entries,
  showFilters = false,
  isLoading = false,
  error,
  hasMore = false,
  totalCount,
}: TokenHistoryViewWrapperProps) {
  const [expandAll, setExpandAll] = useState(false);
  const [filters, setFilters] = useState({});

  const handleToggleExpandAll = () => {
    setExpandAll((prev) => !prev);
  };

  const handleFilterChange = () => {
    // Mock filter change
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleLoadMore = () => {
    // Mock load more
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>Failed to load token history</p>
          <p className={styles.errorMessage}>{error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className={styles.container}>
        {showFilters && (
          <TokenHistoryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            expandAll={expandAll}
            onToggleExpandAll={handleToggleExpandAll}
          />
        )}
        <div className={styles.emptyState}>
          <p>No token history found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showFilters && (
        <TokenHistoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          expandAll={expandAll}
          onToggleExpandAll={handleToggleExpandAll}
        />
      )}

      <TokenHistoryList
        entries={entries}
        hasMore={hasMore}
        isLoadingMore={false}
        onLoadMore={handleLoadMore}
        expandAll={expandAll}
      />

      {totalCount !== undefined && (
        <div className={styles.totalCount}>
          Showing {entries.length} of {totalCount} entries
        </div>
      )}
    </div>
  );
}

/**
 * Default view with history entries and no filters
 */
export const Default = {
  render: () => <TokenHistoryViewWrapper entries={mockEntries} />,
};

/**
 * Loading state while fetching initial data
 */
export const Loading = {
  render: () => <TokenHistoryViewWrapper entries={[]} isLoading={true} />,
};

/**
 * Error state with retry option
 */
export const ErrorState = {
  render: () => (
    <TokenHistoryViewWrapper
      entries={[]}
      error={{ message: 'Failed to fetch token history' } as Error}
    />
  ),
};

/**
 * Empty state when no history entries found
 */
export const Empty = {
  render: () => <TokenHistoryViewWrapper entries={[]} />,
};

/**
 * History page mode with filter controls shown
 */
export const WithFilters = {
  render: () => (
    <TokenHistoryViewWrapper entries={mockEntries} showFilters={true} />
  ),
};

/**
 * With pagination - more entries available to load
 */
export const WithPagination = {
  render: () => (
    <TokenHistoryViewWrapper
      entries={mockEntries}
      hasMore={true}
      totalCount={100}
    />
  ),
};

/**
 * Mixed token types (shows token type in summary)
 */
export const MixedTokenTypes = {
  render: () => {
    const mixedEntries: TokenChangeHistoryEntry[] = [
      ...mockEntries,
      {
        token: 'jkl012ghi345678901234',
        username: 'testuser',
        token_type: 'session',
        token_name: null,
        parent: null,
        scopes: ['read:tap'],
        service: null,
        expires: now + 3600,
        actor: 'testuser',
        action: 'create',
        old_token_name: null,
        old_scopes: null,
        old_expires: null,
        ip_address: '192.168.1.1',
        event_time: now - 1800,
      },
    ];
    return <TokenHistoryViewWrapper entries={mixedEntries} />;
  },
};
