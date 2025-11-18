import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { BadgeSize } from '@lsst-sqre/squared';
import React from 'react';
import { TokenScopeBadge } from './TokenScopeBadge';

export type TokenScopeChangeBadgeProps = {
  /**
   * The type of change: 'added' or 'removed'
   */
  type: 'added' | 'removed';

  /**
   * The scope string (e.g., "read:tap", "exec:notebook")
   */
  scope: string;

  /**
   * The size of the badge
   * @default 'sm'
   */
  size?: BadgeSize;
};

/**
 * Badge component for displaying scope changes in edit actions.
 * Wraps TokenScopeBadge to reuse color logic while adding +/- icons
 * and variant styling to indicate additions vs removals.
 *
 * - Added scopes: soft variant with plus icon
 * - Removed scopes: outline variant with minus icon
 */
export function TokenScopeChangeBadge({
  type,
  scope,
  size = 'sm',
}: TokenScopeChangeBadgeProps) {
  const icon = type === 'added' ? faPlus : faMinus;
  const variant = type === 'added' ? 'soft' : 'outline';

  return (
    <TokenScopeBadge scope={scope} variant={variant} size={size}>
      <FontAwesomeIcon icon={icon} /> {scope}
    </TokenScopeBadge>
  );
}
