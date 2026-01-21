'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import React, { type ReactNode } from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { getLoginUrl } from '../../lib/utils/url';

import styles from './AuthRequired.module.css';

type AuthRequiredProps = {
  children: ReactNode;
  /** Custom loading component while checking authentication */
  loadingFallback?: ReactNode;
};

/**
 * Wrapper component that requires authentication.
 *
 * Use this component in App Router pages that require the user to be logged in.
 * It handles the auth check, loading state, and login redirect automatically.
 *
 * @example
 * ```tsx
 * // In a page component
 * export default function ProtectedPage() {
 *   return (
 *     <AuthRequired>
 *       <h1>Protected Content</h1>
 *     </AuthRequired>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom loading state
 * export default function ProtectedPage() {
 *   return (
 *     <AuthRequired loadingFallback={<PageSkeleton />}>
 *       <PageContent />
 *     </AuthRequired>
 *   );
 * }
 * ```
 */
export default function AuthRequired({
  children,
  loadingFallback,
}: AuthRequiredProps) {
  const repertoireUrl = useRepertoireUrl();
  const { isLoggedIn, isLoading } = useUserInfo(repertoireUrl);

  // Redirect to login if not authenticated (after loading completes)
  if (!isLoading && !isLoggedIn) {
    if (typeof window !== 'undefined') {
      window.location.href = getLoginUrl(window.location.href);
    }
    return null;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return loadingFallback ?? <div className={styles.loading}>Loading...</div>;
  }

  // User is authenticated - render children
  return <>{children}</>;
}
