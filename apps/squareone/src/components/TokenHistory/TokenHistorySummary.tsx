import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import { formatEventTime } from '../TokenDate/formatters';
import styles from './TokenHistorySummary.module.css';

type TokenHistorySummaryProps = {
  entry: TokenChangeHistoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
  showTokenType?: boolean;
};

/**
 * Get the display text for an action.
 */
function getActionText(action: string): string {
  switch (action) {
    case 'create':
      return 'Created';
    case 'edit':
      return 'Edited';
    case 'revoke':
      return 'Revoked';
    case 'expire':
      return 'Expired';
    default:
      return action;
  }
}

/**
 * Get the token identifier for display.
 * - If token has a name, use "Created 'My Token'"
 * - If no name and showTokenType, use "Created session token abc123xyz"
 * - If no name and !showTokenType, use "Created token abc123xyz"
 */
function getTokenIdentifier(
  entry: TokenChangeHistoryEntry,
  showTokenType: boolean
): string {
  if (entry.token_name) {
    return `"${entry.token_name}"`;
  }

  const typePrefix = showTokenType ? `${entry.token_type} token` : 'token';
  return `${typePrefix} ${entry.token}`;
}

export default function TokenHistorySummary({
  entry,
  isExpanded,
  onToggle,
  showTokenType = false,
}: TokenHistorySummaryProps) {
  const timeAgo = formatEventTime(entry.event_time);
  const actionText = getActionText(entry.action);
  const tokenIdentifier = getTokenIdentifier(entry, showTokenType);
  const disclosureIcon = isExpanded ? '⊖' : '⊕';

  return (
    <button
      className={`${styles.summary} ${styles[entry.action]}`}
      onClick={onToggle}
      aria-expanded={isExpanded}
      type="button"
    >
      <span className={styles.icon}>{disclosureIcon}</span>
      <span className={styles.time}>{timeAgo}</span>
      <span className={styles.action}>
        {actionText} {tokenIdentifier}
      </span>
      <span className={styles.actor}>by {entry.actor}</span>
    </button>
  );
}
