/**
 * Times Square API client functions.
 *
 * All functions accept a baseUrl parameter that should be obtained from
 * repertoire service discovery (e.g., 'https://data.lsst.cloud/times-square/api/v1').
 * The baseUrl should include the API version path (/v1).
 */
import { z } from 'zod';

import { TimesSquareError } from './errors';
import {
  type GitHubContentsRoot,
  GitHubContentsRootSchema,
  type GitHubPrContents,
  GitHubPrContentsSchema,
  type HtmlStatus,
  HtmlStatusSchema,
  type Page,
  PageSchema,
  type PageSummary,
  PageSummarySchema,
} from './schemas';

// =============================================================================
// Page Metadata
// =============================================================================

/**
 * Fetch metadata for a specific page by name.
 *
 * @param baseUrl - Times Square base URL (e.g., '/times-square')
 * @param pageName - The page name/slug (e.g., 'summit-weather')
 * @returns Page metadata
 * @throws TimesSquareError if request fails
 */
export async function fetchPage(
  baseUrl: string,
  pageName: string
): Promise<Page> {
  const url = `${normalizeUrl(baseUrl)}/pages/${encodeURIComponent(pageName)}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch page: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return PageSchema.parse(data);
}

/**
 * Fetch a list of all available pages.
 *
 * @param baseUrl - Times Square base URL
 * @returns Array of page summaries
 * @throws TimesSquareError if request fails
 */
export async function fetchPages(baseUrl: string): Promise<PageSummary[]> {
  const url = `${normalizeUrl(baseUrl)}/pages`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch pages: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return z.array(PageSummarySchema).parse(data);
}

// =============================================================================
// GitHub Pages
// =============================================================================

/**
 * Fetch page metadata by GitHub display path.
 *
 * @param baseUrl - Times Square base URL
 * @param displayPath - GitHub display path (e.g., 'lsst-sqre/times-square-demo/matplotlib/gaussian2d')
 * @returns Page metadata
 * @throws TimesSquareError if request fails
 */
export async function fetchGitHubPage(
  baseUrl: string,
  displayPath: string
): Promise<Page> {
  const url = `${normalizeUrl(baseUrl)}/github/${sanitizeDisplayPath(displayPath)}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch GitHub page: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return PageSchema.parse(data);
}

/**
 * Fetch the GitHub contents tree.
 *
 * @param baseUrl - Times Square base URL
 * @returns Hierarchical tree of GitHub-backed pages
 * @throws TimesSquareError if request fails
 */
export async function fetchGitHubContents(
  baseUrl: string
): Promise<GitHubContentsRoot> {
  const url = `${normalizeUrl(baseUrl)}/github`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch GitHub contents: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return GitHubContentsRootSchema.parse(data);
}

// =============================================================================
// GitHub PR Pages
// =============================================================================

/**
 * Fetch page metadata for a PR preview page.
 *
 * @param baseUrl - Times Square base URL
 * @param owner - GitHub owner (organization or username)
 * @param repo - GitHub repository name
 * @param commit - Git commit SHA
 * @param path - Notebook path in repository (without extension)
 * @returns Page metadata
 * @throws TimesSquareError if request fails
 */
export async function fetchGitHubPrPage(
  baseUrl: string,
  owner: string,
  repo: string,
  commit: string,
  path: string
): Promise<Page> {
  const url = `${normalizeUrl(baseUrl)}/github-pr/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(commit)}/${sanitizeDisplayPath(path)}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch GitHub PR page: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return PageSchema.parse(data);
}

/**
 * Fetch the contents tree for a GitHub PR preview.
 *
 * @param baseUrl - Times Square base URL
 * @param owner - GitHub owner (organization or username)
 * @param repo - GitHub repository name
 * @param commit - Git commit SHA
 * @returns PR contents including pages, check status, and PR info
 * @throws TimesSquareError if request fails
 */
export async function fetchGitHubPrContents(
  baseUrl: string,
  owner: string,
  repo: string,
  commit: string
): Promise<GitHubPrContents> {
  const url = `${normalizeUrl(baseUrl)}/github-pr/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(commit)}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch GitHub PR contents: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return GitHubPrContentsSchema.parse(data);
}

// =============================================================================
// HTML Status
// =============================================================================

/**
 * Fetch the HTML rendering status for a page with specific parameters.
 *
 * @param baseUrl - Times Square base URL
 * @param pageName - The page name/slug
 * @param params - Optional parameters to check status for
 * @returns HTML status including availability and content hash
 * @throws TimesSquareError if request fails
 */
export async function fetchHtmlStatus(
  baseUrl: string,
  pageName: string,
  params?: Record<string, string>
): Promise<HtmlStatus> {
  let url = `${normalizeUrl(baseUrl)}/pages/${encodeURIComponent(pageName)}/htmlstatus`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url = `${url}?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch HTML status: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return HtmlStatusSchema.parse(data);
}

/**
 * Fetch the HTML rendering status for a GitHub page with specific parameters.
 *
 * This uses the GitHub display path instead of the page name.
 *
 * @param baseUrl - Times Square base URL
 * @param displayPath - GitHub display path
 * @param params - Optional parameters to check status for
 * @returns HTML status including availability and content hash
 * @throws TimesSquareError if request fails
 */
export async function fetchGitHubHtmlStatus(
  baseUrl: string,
  displayPath: string,
  params?: Record<string, string>
): Promise<HtmlStatus> {
  // First fetch the page to get its name, then use the htmlstatus endpoint
  const page = await fetchGitHubPage(baseUrl, displayPath);

  // Use the page's html_status_url directly, but append params
  let url = page.html_status_url;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new TimesSquareError(
      `Failed to fetch HTML status: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return HtmlStatusSchema.parse(data);
}

// =============================================================================
// Empty/Default Values
// =============================================================================

/**
 * Get empty GitHub contents structure for error fallback.
 */
export function getEmptyGitHubContents(): GitHubContentsRoot {
  return {
    contents: [],
  };
}

/**
 * Get empty GitHub PR contents structure for error fallback.
 */
export function getEmptyGitHubPrContents(): GitHubPrContents {
  return {
    contents: [],
    owner: '',
    repo: '',
    commit: '',
    yaml_check: null,
    nbexec_check: null,
    pull_requests: [],
  };
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Normalize URL by removing trailing slashes.
 *
 * @param url - URL to normalize
 * @returns URL without trailing slashes
 */
function normalizeUrl(url: string): string {
  let normalized = url;
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * Validate and encode a display path for safe URL construction.
 *
 * This function prevents SSRF (Server-Side Request Forgery) attacks by:
 * - Rejecting path traversal sequences (`..` and `.`)
 * - Encoding each path segment with `encodeURIComponent()`
 * - Filtering out empty segments from leading/trailing/double slashes
 *
 * @param displayPath - Path like 'owner/repo/notebook'
 * @returns Encoded path safe for URL construction
 * @throws TimesSquareError if path is empty or contains path traversal sequences
 *
 * @example
 * sanitizeDisplayPath('lsst-sqre/times-square-demo/notebook')
 * // Returns: 'lsst-sqre/times-square-demo/notebook'
 *
 * @example
 * sanitizeDisplayPath('owner/repo/my notebook')
 * // Returns: 'owner/repo/my%20notebook'
 *
 * @example
 * sanitizeDisplayPath('../etc/passwd')
 * // Throws: TimesSquareError
 */
export function sanitizeDisplayPath(displayPath: string): string {
  // Reject empty paths
  if (!displayPath || displayPath.trim() === '') {
    throw new TimesSquareError('Display path cannot be empty', 400);
  }

  const segments = displayPath.split('/');
  const sanitizedSegments: string[] = [];

  for (const segment of segments) {
    // Reject path traversal attempts
    if (segment === '..' || segment === '.') {
      throw new TimesSquareError(
        'Display path cannot contain path traversal sequences',
        400
      );
    }

    // Skip empty segments (from leading/trailing/double slashes)
    if (segment === '') {
      continue;
    }

    // Encode the segment for safe URL construction
    sanitizedSegments.push(encodeURIComponent(segment));
  }

  if (sanitizedSegments.length === 0) {
    throw new TimesSquareError('Display path cannot be empty', 400);
  }

  return sanitizedSegments.join('/');
}

/**
 * Build a URL with parameters appended as query string.
 *
 * @param baseUrl - Base URL
 * @param params - Parameters to append
 * @returns URL with query string
 */
export function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, string>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams(params);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${searchParams.toString()}`;
}

/** Default Times Square v1 API URL for fallback */
export const DEFAULT_TIMES_SQUARE_URL = '/times-square/api/v1';
