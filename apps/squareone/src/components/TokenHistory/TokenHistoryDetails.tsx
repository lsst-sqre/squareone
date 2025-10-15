import React from 'react';
import Link from 'next/link';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import { formatExpirationTimestamp } from '../TokenDate/formatters';
import { TokenScopeBadge } from './TokenScopeBadge';
import { TokenScopeChangeBadge } from './TokenScopeChangeBadge';
import styles from './TokenHistoryDetails.module.css';

export type TokenHistoryDetailsProps = {
  /**
   * The token change history entry to display details for
   */
  entry: TokenChangeHistoryEntry;

  /**
   * Callback for when IP address is clicked to set filter
   * @param ipAddress - The IP address to filter by
   */
  onIpAddressClick?: (ipAddress: string) => void;
};

/**
 * Displays expanded details for a token change history entry.
 * Uses semantic HTML with definition lists for accessibility.
 */
export function TokenHistoryDetails({
  entry,
  onIpAddressClick,
}: TokenHistoryDetailsProps) {
  // Detect scope changes for edit actions
  const scopeChanges = React.useMemo(() => {
    if (entry.action !== 'edit' || !entry.old_scopes) {
      return { added: [], removed: [] };
    }

    const oldScopes = new Set(entry.old_scopes);
    const newScopes = new Set(entry.scopes);

    const added = entry.scopes.filter((scope) => !oldScopes.has(scope));
    const removed = entry.old_scopes.filter((scope) => !newScopes.has(scope));

    return { added, removed };
  }, [entry.action, entry.scopes, entry.old_scopes]);

  // Check if any fields changed for edit actions
  const hasNameChange =
    entry.action === 'edit' &&
    entry.old_token_name !== null &&
    entry.old_token_name !== entry.token_name;

  const hasExpiresChange =
    entry.action === 'edit' &&
    entry.old_expires !== null &&
    entry.old_expires !== entry.expires;

  const hasScopeChanges =
    entry.action === 'edit' &&
    (scopeChanges.added.length > 0 || scopeChanges.removed.length > 0);

  const hasChanges = hasNameChange || hasExpiresChange || hasScopeChanges;

  // Format expiration dates for edit actions (use ISO8601 timestamps for history)
  const oldExpires = entry.old_expires
    ? formatExpirationTimestamp(entry.old_expires)
    : null;
  const newExpires = entry.expires
    ? formatExpirationTimestamp(entry.expires)
    : null;

  return (
    <div className={styles.details}>
      <dl className={styles.metadataList}>
        {/* Token ID (always shown) */}
        <dt className={styles.label}>ID</dt>
        <dd className={styles.value}>
          <Link
            href={`/settings/tokens/${entry.token}`}
            className={styles.link}
          >
            {entry.token}
          </Link>
        </dd>

        {/* Parent token (only if present) */}
        {entry.parent && (
          <>
            <dt className={styles.label}>Parent</dt>
            <dd className={styles.value}>
              <Link
                href={`/settings/tokens/${entry.parent}`}
                className={styles.link}
              >
                {entry.parent}
              </Link>
            </dd>
          </>
        )}

        {/* Actor (always shown) */}
        <dt className={styles.label}>Actor</dt>
        <dd className={styles.value}>
          {entry.actor}
          {entry.ip_address && (
            <>
              {' from '}
              {onIpAddressClick ? (
                <button
                  type="button"
                  onClick={() => onIpAddressClick(entry.ip_address!)}
                  className={styles.ipButton}
                >
                  {entry.ip_address}
                </button>
              ) : (
                <span>{entry.ip_address}</span>
              )}
            </>
          )}
        </dd>

        {/* Timestamp (always shown) */}
        <dt className={styles.label}>Timestamp</dt>
        <dd className={styles.value}>
          {formatExpirationTimestamp(entry.event_time)}
        </dd>

        {/* For create/revoke/expire: show Expires and Scopes */}
        {entry.action !== 'edit' && (
          <>
            {/* Expires (if present) */}
            {entry.expires && (
              <>
                <dt className={styles.label}>Expires</dt>
                <dd className={styles.value}>
                  {formatExpirationTimestamp(entry.expires)}
                </dd>
              </>
            )}

            {/* Scopes */}
            {entry.scopes.length > 0 && (
              <>
                <dt className={styles.label}>Scopes</dt>
                <dd className={styles.value}>
                  <div className={styles.scopeList}>
                    {entry.scopes.map((scope) => (
                      <TokenScopeBadge key={scope} scope={scope} />
                    ))}
                  </div>
                </dd>
              </>
            )}
          </>
        )}

        {/* For edit: show Changes section */}
        {entry.action === 'edit' && hasChanges && (
          <>
            <h4 className={styles.changesHeading}>Changes</h4>

            {/* Name change */}
            {hasNameChange && (
              <>
                <dt className={styles.label}>Name</dt>
                <dd className={styles.value}>
                  <span className={styles.oldValue}>
                    {entry.old_token_name}
                  </span>
                  {' → '}
                  {entry.token_name}
                </dd>
              </>
            )}

            {/* Expires change */}
            {hasExpiresChange && (
              <>
                <dt className={styles.label}>Expires</dt>
                <dd className={styles.value}>
                  <span className={styles.oldValue}>{oldExpires}</span>
                  {' → '}
                  {newExpires}
                </dd>
              </>
            )}

            {/* Scope changes */}
            {hasScopeChanges && (
              <>
                <dt className={styles.label}>Scopes</dt>
                <dd className={styles.value}>
                  <div className={styles.scopeList}>
                    {scopeChanges.removed.map((scope) => (
                      <TokenScopeChangeBadge
                        key={`removed-${scope}`}
                        type="removed"
                        scope={scope}
                      />
                    ))}
                    {scopeChanges.added.map((scope) => (
                      <TokenScopeChangeBadge
                        key={`added-${scope}`}
                        type="added"
                        scope={scope}
                      />
                    ))}
                  </div>
                </dd>
              </>
            )}
          </>
        )}
      </dl>
    </div>
  );
}
