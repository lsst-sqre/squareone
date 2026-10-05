'use client';

import {
  type AuthQueryConfig,
  type UseUserScopesReturn,
  // biome-ignore lint/style/noRestrictedImports: this module is the app's one wrapper around the package hook.
  useUserScopes as usePackageUserScopes,
} from '@lsst-sqre/gafaelfawr-client';
import { useMemo } from 'react';

import { makeReportError } from '../lib/sentry/reportError';
import { useRepertoireUrl } from './useRepertoireUrl';

/** Sentry tags for a user-scopes failure, as the server prefetch sets them. */
const USER_SCOPES_CONTEXT = {
  site: 'user-scopes',
  package: 'gafaelfawr-client',
} as const;

/**
 * Query options a caller may add. The reporter and its context are always the
 * app's own, so they are not overridable.
 */
export type UserScopesConfig = Omit<AuthQueryConfig, 'reportError' | 'context'>;

/**
 * The signed-in user's Gafaelfawr scopes, for gating what the header, Apps
 * menu, and homepage hero show; reporting report-worthy failures to Sentry.
 *
 * App code calls this rather than `useUserScopes` from
 * `@lsst-sqre/gafaelfawr-client` (a lint rule enforces it), for the same
 * reason as `useLoginInfo` and `useUserInfo`: every observer of the query
 * shares one TanStack Query entry whose `queryFn` is the last observer's, so
 * every observer must carry the app's Sentry reporter, tagged
 * `site: user-scopes`.
 *
 * In the browser the scopes derive from login info, sharing its request. The
 * root layout hydrates the entry on the server (`prefetchUserScopes`) from
 * login info on a plain-ingress route, or from the delegated token's
 * `token-info` on a GafaelfawrIngress route where login info cannot be
 * fetched; either way it answers the first render. The reporter and context
 * are not part of the query key.
 *
 * @param config - Extra query options, such as a `logger`
 */
export function useUserScopes(config?: UserScopesConfig): UseUserScopesReturn {
  const repertoireUrl = useRepertoireUrl();
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);
  return usePackageUserScopes(repertoireUrl, {
    ...config,
    reportError,
    context: USER_SCOPES_CONTEXT,
  });
}
