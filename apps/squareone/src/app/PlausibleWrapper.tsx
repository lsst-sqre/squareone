'use client';

import PlausibleProvider from 'next-plausible';
import type { ReactNode } from 'react';

type PlausibleWrapperProps = {
  children: ReactNode;
  /** Plausible domain for analytics tracking. If not provided, analytics are disabled. */
  domain?: string;
};

/**
 * Conditional Plausible analytics wrapper.
 *
 * Only renders PlausibleProvider if a domain is configured. This allows
 * deployment environments to optionally enable analytics via configuration.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <PlausibleWrapper domain={config.plausibleDomain}>
 *   {children}
 * </PlausibleWrapper>
 * ```
 */
export default function PlausibleWrapper({
  children,
  domain,
}: PlausibleWrapperProps) {
  if (!domain) {
    return <>{children}</>;
  }

  return <PlausibleProvider domain={domain}>{children}</PlausibleProvider>;
}
