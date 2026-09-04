'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import React, { type ReactNode } from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import {
  type AdminPageId,
  getRequiredAdminScopes,
  hasAdminPageAccess,
  hasAnyAdminAccess,
} from '../../lib/config/adminPageScopes';
import AuthRequired from '../AuthRequired';
import ScopeList from '../ScopeList';

import styles from './AdminRequired.module.css';

type AdminRequiredProps = {
  children: ReactNode;
  /**
   * Gate on this admin page's configured scopes instead of on the whole
   * section. Omit at the layout, pass at a page.
   */
  pageId?: AdminPageId;
  /** Custom loading component while checking authorization */
  loadingFallback?: ReactNode;
};

/**
 * Wrapper component that requires login and a configured admin scope.
 *
 * Use this component to gate admin-only content. It composes {@link AuthRequired}
 * to require authentication (redirecting unauthenticated users to login) and
 * additionally checks the user's Gafaelfawr scopes from `useLoginInfo()` against
 * the `adminPageScopes` configuration. Logged-in users without a granting scope
 * see an "unauthorized" state, naming the scopes that would have let them in,
 * instead of the children.
 *
 * There is no single "admin" scope. Without `pageId` the gate admits anyone who
 * can reach *some* admin page (the union rule that guards the section as a
 * whole); with `pageId` it admits only holders of that page's own configured
 * scopes, so a person who arrives at a page directly — from a bookmark, or a
 * link shared by a colleague with different scopes — is turned away in-page
 * rather than bounced elsewhere.
 *
 * This is a client-side, defense-in-depth gate that runs alongside the Phalanx
 * ingress restricting the `/admin` route prefix in deployment.
 *
 * @example
 * ```tsx
 * // Applied at the admin layout so every admin page inherits the section gate
 * export default function AdminLayoutClient({ children }: Props) {
 *   return (
 *     <AdminRequired>
 *       <SidebarLayout sidebarTitle="Admin" ...>{children}</SidebarLayout>
 *     </AdminRequired>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Applied at a page so it gates on its own scopes
 * export default function ServiceTokenPage() {
 *   return (
 *     <AdminRequired pageId="serviceTokens">
 *       <ServiceTokenPageClient />
 *     </AdminRequired>
 *   );
 * }
 * ```
 */
export default function AdminRequired({
  children,
  pageId,
  loadingFallback,
}: AdminRequiredProps) {
  return (
    <AuthRequired loadingFallback={loadingFallback}>
      <AdminScopeGate pageId={pageId} loadingFallback={loadingFallback}>
        {children}
      </AdminScopeGate>
    </AuthRequired>
  );
}

type AdminScopeGateProps = {
  children: ReactNode;
  pageId?: AdminPageId;
  loadingFallback?: ReactNode;
};

/**
 * Inner gate that checks the configured admin scopes. Rendered only once
 * {@link AuthRequired} has confirmed the user is logged in.
 */
function AdminScopeGate({
  children,
  pageId,
  loadingFallback,
}: AdminScopeGateProps) {
  const config = useStaticConfig();
  const repertoireUrl = useRepertoireUrl();
  const { query, isLoading } = useLoginInfo(repertoireUrl);

  // Wait for login info before deciding, so authorized users never flash the
  // unauthorized state.
  if (isLoading) {
    return loadingFallback ?? <div className={styles.loading}>Loading...</div>;
  }

  const userScopes = query?.scopes ?? [];
  const authorized = pageId
    ? hasAdminPageAccess(config, userScopes, pageId)
    : hasAnyAdminAccess(config, userScopes);

  if (!authorized) {
    // Name the scopes that would have granted access so the person has
    // something concrete to ask their administrator for — the answer differs
    // per deployment, so it cannot be a fixed string.
    const requiredScopes = getRequiredAdminScopes(config, pageId);

    return (
      <div className={styles.unauthorized}>
        <h1>Unauthorized</h1>
        <p>
          You do not have permission to access{' '}
          {pageId ? 'this admin page' : 'the admin section'}.
          {requiredScopes.length > 0 && (
            <>
              {' '}
              The <ScopeList scopes={requiredScopes} /> scope
              {requiredScopes.length > 1 ? 's are' : ' is'} required.
            </>
          )}{' '}
          If you believe this is an error, contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
