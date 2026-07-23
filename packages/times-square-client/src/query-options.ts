/**
 * TanStack Query options factories for Times Square queries.
 *
 * These factory functions return queryOptions objects that can be used
 * with useQuery or prefetched in server components.
 */
import {
  defaultLogger,
  type Logger,
  type ReportContext,
  type ReportError,
  reportingQueryFn,
} from '@lsst-sqre/api-client-core';
import { queryOptions } from '@tanstack/react-query';

import {
  DEFAULT_TIMES_SQUARE_URL,
  fetchGitHubContents,
  fetchGitHubPage,
  fetchGitHubPrContents,
  fetchGitHubPrPage,
  fetchHtmlStatus,
  fetchHtmlStatusByUrl,
  fetchPage,
  fetchPages,
  getEmptyGitHubContents,
  getEmptyGitHubPrContents,
} from './client';
import { timesSquareKeys } from './query-keys';
import type {
  GitHubContentsRoot,
  GitHubPrContents,
  HtmlStatus,
  Page,
  PageSummary,
} from './schemas';

// Re-export Logger from api-client-core so existing
// `import { Logger } from '@lsst-sqre/times-square-client'` sites keep compiling.
export type { Logger };

/**
 * Configuration for the GitHub-contents query options
 * ({@link githubContentsQueryOptions}, {@link githubPrContentsQueryOptions}).
 */
export type GitHubContentsQueryConfig = {
  logger?: Logger;
  /**
   * Hook invoked for report-worthy failures (contract drift, 5xx, server-side
   * network errors). Injected by the app so this package stays Sentry-agnostic;
   * see `@lsst-sqre/api-client-core`'s `reportingQueryFn`. Expected failures
   * (401/403) never reach this hook.
   */
  reportError?: ReportError;
  /** Context (e.g. `{ site, package }`) forwarded to `reportError`. */
  context?: ReportContext;
  /**
   * Runtime override forwarded to the error classifier: controls whether
   * network-level failures are report-worthy. Defaults to auto-detection.
   */
  isServer?: boolean;
};

// =============================================================================
// Page Queries
// =============================================================================

/**
 * Query options for fetching a list of all pages.
 *
 * @param baseUrl - Times Square base URL
 */
export const pagesQueryOptions = (baseUrl: string = DEFAULT_TIMES_SQUARE_URL) =>
  queryOptions<PageSummary[]>({
    queryKey: timesSquareKeys.pageList(),
    queryFn: () => fetchPages(baseUrl),
    enabled: !!baseUrl,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

/**
 * Query options for fetching a specific page by name.
 *
 * @param pageName - Page name/slug
 * @param baseUrl - Times Square base URL
 */
export const pageQueryOptions = (
  pageName: string,
  baseUrl: string = DEFAULT_TIMES_SQUARE_URL
) =>
  queryOptions<Page>({
    queryKey: timesSquareKeys.page(pageName),
    queryFn: () => fetchPage(baseUrl, pageName),
    enabled: !!pageName && !!baseUrl,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

// =============================================================================
// HTML Status Queries
// =============================================================================

/**
 * Query options for fetching HTML rendering status.
 *
 * Uses polling (refetchInterval) to track notebook execution progress.
 * The 1-second interval matches the current SWR implementation.
 *
 * @param pageName - Page name/slug
 * @param params - Optional notebook parameters
 * @param baseUrl - Times Square base URL
 */
export const htmlStatusQueryOptions = (
  pageName: string,
  params?: Record<string, string>,
  baseUrl: string = DEFAULT_TIMES_SQUARE_URL
) =>
  queryOptions<HtmlStatus>({
    queryKey: timesSquareKeys.htmlStatusForPage(pageName, params),
    queryFn: () => fetchHtmlStatus(baseUrl, pageName, params),
    enabled: !!pageName && !!baseUrl,
    // Poll every second to track execution progress
    refetchInterval: 1000,
    staleTime: 0, // Always consider stale to ensure polling works
    gcTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

/**
 * Query options for fetching HTML rendering status by direct URL.
 *
 * This is useful when you already have the html_status_url from page metadata
 * and want to avoid an extra API call to fetch the page first.
 *
 * Uses polling (refetchInterval) to track notebook execution progress.
 *
 * @param htmlStatusUrl - Direct URL to the HTML status endpoint
 * @param params - Optional notebook parameters to append to URL
 */
export const htmlStatusUrlQueryOptions = (
  htmlStatusUrl: string,
  params?: Record<string, string>
) =>
  queryOptions<HtmlStatus>({
    queryKey: timesSquareKeys.htmlStatusByUrl(htmlStatusUrl, params),
    queryFn: () => fetchHtmlStatusByUrl(htmlStatusUrl, params),
    enabled: !!htmlStatusUrl,
    // Poll every second to track execution progress
    refetchInterval: 1000,
    staleTime: 0, // Always consider stale to ensure polling works
    gcTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

// =============================================================================
// GitHub Contents Queries
// =============================================================================

/**
 * Query options for fetching the GitHub contents tree.
 *
 * Returns empty contents on error for graceful degradation.
 *
 * @param baseUrl - Times Square base URL
 */
export const githubContentsQueryOptions = (
  baseUrl: string = DEFAULT_TIMES_SQUARE_URL,
  options?: GitHubContentsQueryConfig
) => {
  const logger = options?.logger ?? defaultLogger;
  const { reportError, context, isServer } = options ?? {};

  return queryOptions<GitHubContentsRoot>({
    queryKey: timesSquareKeys.githubContents(),
    // Delegate to the shared reporting wrapper: it returns empty contents on
    // any failure (preserving the graceful-degradation nav tree), logs every
    // failure, and invokes the injected `reportError` only for report-worthy
    // ones (ZodError contract drift, 5xx, server-side network errors) — so a
    // Times Square outage no longer silently collapses the nav tree.
    queryFn: reportingQueryFn<GitHubContentsRoot>({
      fetchFn: () => fetchGitHubContents(baseUrl),
      fallback: getEmptyGitHubContents(),
      logger,
      reportError,
      context,
      isServer,
    }),
    enabled: !!baseUrl,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Query options for fetching a GitHub page by display path.
 *
 * @param displayPath - GitHub display path (e.g., 'org/repo/dir/page')
 * @param baseUrl - Times Square base URL
 */
export const githubPageQueryOptions = (
  displayPath: string,
  baseUrl: string = DEFAULT_TIMES_SQUARE_URL
) =>
  queryOptions<Page>({
    queryKey: timesSquareKeys.githubPage(displayPath),
    queryFn: () => fetchGitHubPage(baseUrl, displayPath),
    enabled: !!displayPath && !!baseUrl,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

// =============================================================================
// GitHub PR Queries
// =============================================================================

/**
 * Query options for fetching GitHub PR contents.
 *
 * Returns empty contents on error for graceful degradation.
 *
 * @param owner - GitHub owner
 * @param repo - GitHub repository
 * @param commit - Git commit SHA
 * @param baseUrl - Times Square base URL
 */
export const githubPrContentsQueryOptions = (
  owner: string,
  repo: string,
  commit: string,
  baseUrl: string = DEFAULT_TIMES_SQUARE_URL,
  options?: GitHubContentsQueryConfig
) => {
  const logger = options?.logger ?? defaultLogger;
  const { reportError, context, isServer } = options ?? {};

  return queryOptions<GitHubPrContents>({
    queryKey: timesSquareKeys.githubPrContents(owner, repo, commit),
    // Delegate to the shared reporting wrapper: it returns empty PR contents on
    // any failure (preserving the graceful-degradation empty-PR view), logs
    // every failure, and invokes the injected `reportError` only for
    // report-worthy ones (ZodError contract drift, 5xx, server-side network
    // errors). The `owner`/`repo`/`commit` identifiers ride along in the
    // forwarded context so the reporter can tag the failing PR preview.
    queryFn: reportingQueryFn<GitHubPrContents>({
      fetchFn: () => fetchGitHubPrContents(baseUrl, owner, repo, commit),
      fallback: getEmptyGitHubPrContents(),
      logger,
      reportError,
      context: { owner, repo, commit, ...context },
      isServer,
    }),
    enabled: !!owner && !!repo && !!commit && !!baseUrl,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Query options for fetching a GitHub PR page.
 *
 * @param owner - GitHub owner
 * @param repo - GitHub repository
 * @param commit - Git commit SHA
 * @param path - Notebook path in repository
 * @param baseUrl - Times Square base URL
 */
export const githubPrPageQueryOptions = (
  owner: string,
  repo: string,
  commit: string,
  path: string,
  baseUrl: string = DEFAULT_TIMES_SQUARE_URL
) =>
  queryOptions<Page>({
    queryKey: timesSquareKeys.githubPrPage(owner, repo, commit, path),
    queryFn: () => fetchGitHubPrPage(baseUrl, owner, repo, commit, path),
    enabled: !!owner && !!repo && !!commit && !!path && !!baseUrl,
    staleTime: 10_000, // 10 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
