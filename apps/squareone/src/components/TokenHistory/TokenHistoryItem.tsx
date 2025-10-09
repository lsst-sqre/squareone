import React, { useState, useEffect } from 'react';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import TokenHistorySummary from './TokenHistorySummary';
import { TokenHistoryDetails } from './TokenHistoryDetails';
import styles from './TokenHistoryItem.module.css';

type TokenHistoryItemProps = {
  entry: TokenChangeHistoryEntry;
  showTokenType?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
};

/**
 * A single expandable token history item.
 * Supports both controlled and uncontrolled expansion state.
 *
 * - Controlled: Pass both `isExpanded` and `onToggle` props
 * - Uncontrolled: Don't pass `isExpanded` or `onToggle`, component manages its own state
 */
export default function TokenHistoryItem({
  entry,
  showTokenType = false,
  isExpanded: controlledIsExpanded,
  onToggle: controlledOnToggle,
}: TokenHistoryItemProps) {
  // Internal state for uncontrolled mode
  const [uncontrolledIsExpanded, setUncontrolledIsExpanded] = useState(false);

  // Determine if we're in controlled mode
  const isControlled =
    controlledIsExpanded !== undefined && controlledOnToggle !== undefined;

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = isControlled
    ? controlledIsExpanded
    : uncontrolledIsExpanded;

  // Handle toggle
  const handleToggle = () => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setUncontrolledIsExpanded((prev) => !prev);
    }
  };

  // Sync uncontrolled state when switching from controlled to uncontrolled
  useEffect(() => {
    if (!isControlled && controlledIsExpanded !== undefined) {
      setUncontrolledIsExpanded(controlledIsExpanded);
    }
  }, [isControlled, controlledIsExpanded]);

  return (
    <div className={styles.item}>
      <TokenHistorySummary
        entry={entry}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        showTokenType={showTokenType}
      />
      {isExpanded && (
        <div className={styles.details}>
          <TokenHistoryDetails entry={entry} />
        </div>
      )}
    </div>
  );
}
