import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lsst-sqre/squared';
import React, { useEffect, useState } from 'react';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import TokenHistoryItem from './TokenHistoryItem';
import styles from './TokenHistoryList.module.css';

type TokenHistoryListProps = {
  entries: TokenChangeHistoryEntry[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  expandAll?: boolean;
};

/**
 * List container for token history entries.
 * Manages expansion state and pagination.
 */
export default function TokenHistoryList({
  entries,
  hasMore,
  isLoadingMore,
  onLoadMore,
  expandAll,
}: TokenHistoryListProps) {
  // Track individual item expansion states keyed by token ID
  const [expandedItems, setExpandedItems] = useState<Map<string, boolean>>(
    new Map()
  );

  // Detect if multiple token types are present
  const uniqueTypes = new Set(entries.map((e) => e.token_type));
  const showTokenType = uniqueTypes.size > 1;

  // Update expansion states when expandAll changes
  useEffect(() => {
    if (expandAll !== undefined) {
      // When expandAll changes, update all currently loaded items
      const newExpandedItems = new Map<string, boolean>();
      entries.forEach((entry) => {
        newExpandedItems.set(entry.token, expandAll);
      });
      setExpandedItems(newExpandedItems);
    }
  }, [expandAll, entries]);

  // Handle individual item toggle
  const handleItemToggle = (tokenKey: string) => {
    setExpandedItems((prev) => {
      const next = new Map(prev);
      next.set(tokenKey, !prev.get(tokenKey));
      return next;
    });
  };

  // Empty state
  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No token history found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {entries.map((entry) => (
          <TokenHistoryItem
            key={entry.token}
            entry={entry}
            showTokenType={showTokenType}
            isExpanded={expandedItems.get(entry.token)}
            onToggle={() => handleItemToggle(entry.token)}
          />
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            loading={isLoadingMore}
            leadingIcon={isLoadingMore ? faSpinner : undefined}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
