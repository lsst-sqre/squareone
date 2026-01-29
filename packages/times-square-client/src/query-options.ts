/**
 * TanStack Query options factories for Times Square queries.
 *
 * These factory functions return queryOptions objects that can be used
 * with useQuery or prefetched in server components.
 */
import { queryOptions } from '@tanstack/react-query';

/**
 * Minimal logger interface compatible with pino's calling convention.
 */
export type Logger = {
  debug: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
};

const defaultLogger: Logger = {
  debug: (obj, msg) => console.log(msg, obj),
  warn: (obj, msg) => console.warn(msg, obj),
  error: (obj, msg) => console.error(msg, obj),
};

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
  options?: { logger?: Logger }
) => {
  const log = options?.logger ?? defaultLogger;

  return queryOptions<GitHubContentsRoot>({
    queryKey: timesSquareKeys.githubContents(),
    queryFn: async () => {
      try {
        return await fetchGitHubContents(baseUrl);
      } catch (error) {
        log.error({ err: error }, 'Failed to fetch GitHub contents');
        return getEmptyGitHubContents();
      }
    },
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
  options?: { logger?: Logger }
) => {
  const log = options?.logger ?? defaultLogger;

  return queryOptions<GitHubPrContents>({
    queryKey: timesSquareKeys.githubPrContents(owner, repo, commit),
    queryFn: async () => {
      try {
        return await fetchGitHubPrContents(baseUrl, owner, repo, commit);
      } catch (error) {
        log.error(
          { err: error, owner, repo, commit },
          'Failed to fetch GitHub PR contents'
        );
        return getEmptyGitHubPrContents();
      }
    },
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
