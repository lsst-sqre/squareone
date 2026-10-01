'use client';

import {
  type AuthQueryConfig,
  type UseLoginInfoReturn,
  // biome-ignore lint/style/noRestrictedImports: this module is the app's one wrapper around the package hook.
  useLoginInfo as usePackageLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import { useMemo } from 'react';

import { makeReportError } from '../lib/sentry/reportError';
import { useRepertoireUrl } from './useRepertoireUrl';

/** Sentry tags for a login-info failure, as the server prefetch sets them. */
const LOGIN_INFO_CONTEXT = {
  site: 'login-info',
  package: 'gafaelfawr-client',
} as const;

/**
 * Query options a caller may add. The reporter and its context are always the
 * app's own, so they are not overridable.
 */
export type LoginInfoConfig = Omit<AuthQueryConfig, 'reportError' | 'context'>;

/**
 * The signed-in user's Gafaelfawr login info (scopes, CSRF token), reporting
 * report-worthy failures to Sentry.
 *
 * App code calls this rather than `useLoginInfo` from
 * `@lsst-sqre/gafaelfawr-client` (a lint rule enforces it). Every observer of
 * the login-info query shares one TanStack Query entry, whose `queryFn` is the
 * one from whichever observer last set its options, so a single observer
 * without the reporter would leave the fetches it drives unreported. Routing
 * every observer through this hook makes each fetch carry the app's Sentry
 * reporter, tagged `site: login-info`: contract drift (a `ZodError`), 5xx
 * responses, and server-side network errors reach Sentry, while an expected
 * 401/403 stays a quiet `null`.
 *
 * The Gafaelfawr URL is discovered through the configured Repertoire URL. The
 * reporter and context are not part of the query key, so the entry the root
 * layout prefetches and hydrates (`prefetchLoginInfo`) still answers the first
 * render.
 *
 * @param config - Extra query options, such as a `logger`
 */
export function useLoginInfo(config?: LoginInfoConfig): UseLoginInfoReturn {
  const repertoireUrl = useRepertoireUrl();
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);
  return usePackageLoginInfo(repertoireUrl, {
    ...config,
    reportError,
    context: LOGIN_INFO_CONTEXT,
  });
}
