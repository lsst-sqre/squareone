import { useState } from 'react';
import useTokenChangeHistory, {
  type TokenType,
} from '../../hooks/useTokenChangeHistory';
import useTokenHistoryFilters from '../../hooks/useTokenHistoryFilters';
import TokenHistoryFilters from './TokenHistoryFilters';
import TokenHistoryList from './TokenHistoryList';
import styles from './TokenHistoryView.module.css';

export type TokenHistoryViewProps = {
  username: string;
  initialTokenType?: TokenType | TokenType[]; // Support single or multiple types
  showFilters?: boolean; // Default: false - only true on history page
  token?: string; // Pre-filter to specific token (for token details page)
};

/**
 * Main container component for token history display.
 * Integrates filters, data fetching, and list rendering.
 *
 * Usage contexts:
 * 1. History page: showFilters={true}, shows filter controls
 * 2. Token details page: showFilters={false}, token={tokenKey} for pre-filtered history
 */
export default function TokenHistoryView({
  username,
  initialTokenType,
  showFilters = false,
  token,
}: TokenHistoryViewProps) {
  const [expandAll, setExpandAll] = useState(false);

  // URL-based filter state management
  const { filters, setFilter, clearAllFilters } = useTokenHistoryFilters();

  // Merge URL filters with props (token prop takes precedence)
  const effectiveFilters = {
    tokenType: initialTokenType,
    token: token || filters.token,
    since: filters.since,
    until: filters.until,
    ipAddress: filters.ipAddress,
  };

  // Fetch token change history with filters
  const {
    entries,
    isLoading,
    error,
    hasMore,
    totalCount,
    loadMore,
    isLoadingMore,
  } = useTokenChangeHistory(username, effectiveFilters);

  const handleToggleExpandAll = () => {
    setExpandAll((prev) => !prev);
  };

  const handleFilterChange = (partialFilters: Partial<typeof filters>) => {
    // Update each filter individually
    Object.entries(partialFilters).forEach(([key, value]) => {
      setFilter(key as keyof typeof filters, value);
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  // Error state
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

  // Empty state
  if (!entries || entries.length === 0) {
    return (
      <div className={styles.container}>
        {showFilters && (
          <TokenHistoryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
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
          key="token-history-filters"
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          expandAll={expandAll}
          onToggleExpandAll={handleToggleExpandAll}
        />
      )}

      <TokenHistoryList
        entries={entries}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
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
