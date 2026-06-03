'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import React, { type ReactNode } from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import AuthRequired from '../AuthRequired';

import styles from './AdminRequired.module.css';

/** Gafaelfawr scope required to access the admin section. */
const ADMIN_SCOPE = 'exec:admin';

type AdminRequiredProps = {
  children: ReactNode;
  /** Custom loading component while checking authorization */
  loadingFallback?: ReactNode;
};

/**
 * Wrapper component that requires login and the `exec:admin` Gafaelfawr scope.
 *
 * Use this component to gate admin-only content. It composes {@link AuthRequired}
 * to require authentication (redirecting unauthenticated users to login) and
 * additionally checks the `exec:admin` scope via `useLoginInfo()`. Logged-in
 * users without the scope see an "unauthorized" state instead of the children.
 *
 * This is a client-side, defense-in-depth gate that runs alongside the Phalanx
 * ingress restricting the `/admin` route prefix in deployment.
 *
 * @example
 * ```tsx
 * // Applied at the admin layout so every admin page inherits the gate
 * export default function AdminLayoutClient({ children }: Props) {
 *   return (
 *     <AdminRequired>
 *       <SidebarLayout sidebarTitle="Admin" ...>{children}</SidebarLayout>
 *     </AdminRequired>
 *   );
 * }
 * ```
 */
export default function AdminRequired({
  children,
  loadingFallback,
}: AdminRequiredProps) {
  return (
    <AuthRequired loadingFallback={loadingFallback}>
      <AdminScopeGate loadingFallback={loadingFallback}>
        {children}
      </AdminScopeGate>
    </AuthRequired>
  );
}

type AdminScopeGateProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
};

/**
 * Inner gate that checks the `exec:admin` scope. Rendered only once
 * {@link AuthRequired} has confirmed the user is logged in.
 */
function AdminScopeGate({ children, loadingFallback }: AdminScopeGateProps) {
  const repertoireUrl = useRepertoireUrl();
  const { query, isLoading } = useLoginInfo(repertoireUrl);

  // Wait for login info before deciding, so authorized users never flash the
  // unauthorized state.
  if (isLoading) {
    return loadingFallback ?? <div className={styles.loading}>Loading...</div>;
  }

  if (!query?.hasScope(ADMIN_SCOPE)) {
    return (
      <div className={styles.unauthorized}>
        <h1>Unauthorized</h1>
        <p>
          You do not have permission to access the admin section. The{' '}
          <code>{ADMIN_SCOPE}</code> scope is required. If you believe this is
          an error, contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
