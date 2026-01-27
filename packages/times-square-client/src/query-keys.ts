/**
 * TanStack Query key factory for Times Square queries.
 *
 * Provides a hierarchical key structure for cache management:
 * - ['times-square'] - Root key for all Times Square data
 * - ['times-square', 'pages'] - All page-related queries
 * - ['times-square', 'pages', pageName] - Specific page metadata
 * - ['times-square', 'html-status', pageName, params] - HTML status for page
 * - ['times-square', 'github'] - GitHub-related queries
 * - ['times-square', 'github-pr'] - GitHub PR-related queries
 */

/**
 * Query key factory for Times Square queries.
 *
 * Usage:
 * ```ts
 * // Invalidate all Times Square data
 * queryClient.invalidateQueries({ queryKey: timesSquareKeys.all });
 *
 * // Invalidate all page data
 * queryClient.invalidateQueries({ queryKey: timesSquareKeys.pages() });
 *
 * // Invalidate specific page
 * queryClient.invalidateQueries({ queryKey: timesSquareKeys.page('summit-weather') });
 *
 * // Invalidate GitHub PR contents
 * queryClient.invalidateQueries({ queryKey: timesSquareKeys.githubPrContents('owner', 'repo', 'sha') });
 * ```
 */
export const timesSquareKeys = {
  /** Root key for all Times Square data */
  all: ['times-square'] as const,

  // ===========================================================================
  // Pages
  // ===========================================================================

  /** Root key for all page queries */
  pages: () => [...timesSquareKeys.all, 'pages'] as const,

  /** Page list query key */
  pageList: () => [...timesSquareKeys.pages(), 'list'] as const,

  /** Specific page metadata by name */
  page: (pageName: string) => [...timesSquareKeys.pages(), pageName] as const,

  // ===========================================================================
  // HTML Status
  // ===========================================================================

  /** Root key for all HTML status queries */
  htmlStatus: () => [...timesSquareKeys.all, 'html-status'] as const,

  /**
   * HTML status for a specific page with parameters.
   *
   * Parameters are included in the key to cache different parameter
   * combinations separately.
   */
  htmlStatusForPage: (pageName: string, params?: Record<string, string>) =>
    [...timesSquareKeys.htmlStatus(), pageName, params ?? {}] as const,

  /**
   * HTML status by direct URL with parameters.
   *
   * Used when the html_status_url is already known from page metadata.
   */
  htmlStatusByUrl: (htmlStatusUrl: string, params?: Record<string, string>) =>
    [
      ...timesSquareKeys.htmlStatus(),
      'url',
      htmlStatusUrl,
      params ?? {},
    ] as const,

  // ===========================================================================
  // GitHub Contents
  // ===========================================================================

  /** Root key for all GitHub queries */
  github: () => [...timesSquareKeys.all, 'github'] as const,

  /** GitHub contents tree */
  githubContents: () => [...timesSquareKeys.github(), 'contents'] as const,

  /** Specific GitHub page by display path */
  githubPage: (displayPath: string) =>
    [...timesSquareKeys.github(), 'page', displayPath] as const,

  /**
   * GitHub page HTML status with parameters.
   */
  githubHtmlStatus: (displayPath: string, params?: Record<string, string>) =>
    [
      ...timesSquareKeys.github(),
      'html-status',
      displayPath,
      params ?? {},
    ] as const,

  // ===========================================================================
  // GitHub PR
  // ===========================================================================

  /** Root key for all GitHub PR queries */
  githubPr: () => [...timesSquareKeys.all, 'github-pr'] as const,

  /** GitHub PR contents for a specific commit */
  githubPrContents: (owner: string, repo: string, commit: string) =>
    [...timesSquareKeys.githubPr(), 'contents', owner, repo, commit] as const,

  /** Specific GitHub PR page */
  githubPrPage: (owner: string, repo: string, commit: string, path: string) =>
    [...timesSquareKeys.githubPr(), 'page', owner, repo, commit, path] as const,

  /**
   * GitHub PR page HTML status with parameters.
   */
  githubPrHtmlStatus: (
    owner: string,
    repo: string,
    commit: string,
    path: string,
    params?: Record<string, string>
  ) =>
    [
      ...timesSquareKeys.githubPr(),
      'html-status',
      owner,
      repo,
      commit,
      path,
      params ?? {},
    ] as const,
};

/**
 * Type helper for query key types.
 * Useful for typing queryKey parameters in custom hooks.
 */
export type TimesSquareQueryKeys = typeof timesSquareKeys;
