import {
  Badge,
  type BadgeColor,
  type BadgeSize,
  type BadgeVariant,
} from '@lsst-sqre/squared';
import type React from 'react';

export type TokenScopeBadgeProps = {
  /**
   * The scope string (e.g., "read:tap", "exec:notebook")
   */
  scope: string;

  /**
   * The size of the badge
   * @default 'sm'
   */
  size?: BadgeSize;

  /**
   * The visual variant of the badge
   * @default 'soft'
   */
  variant?: BadgeVariant;

  /**
   * Custom content to display (overrides default scope text)
   * Useful for adding icons or custom formatting
   */
  children?: React.ReactNode;
};

/**
 * Maps scope prefix to semantic color
 * Based on existing pattern from AccessTokenItem
 */
function getScopeColor(scope: string): BadgeColor {
  if (scope.startsWith('exec:')) return 'red';
  if (scope.startsWith('read:')) return 'green';
  if (scope.startsWith('write:')) return 'yellow';
  return 'gray';
}

/**
 * Badge component wrapper that applies scope-specific colors
 * Single source of truth for scope color logic across the application
 */
export function TokenScopeBadge({
  scope,
  size = 'sm',
  variant = 'soft',
  children,
}: TokenScopeBadgeProps) {
  const color = getScopeColor(scope);

  return (
    <Badge variant={variant} color={color} radius="full" size={size}>
      {children ?? scope}
    </Badge>
  );
}
