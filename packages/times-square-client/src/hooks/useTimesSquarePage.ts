'use client';

/**
 * Hook for fetching Times Square page metadata.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TIMES_SQUARE_URL } from '../client';
import {
  githubPageQueryOptions,
  githubPrPageQueryOptions,
} from '../query-options';
import type { FormattedText, GitHubSourceMetadata, Page } from '../schemas';

import { useTimesSquareUrl } from './useTimesSquareUrl';

/**
 * Options for useTimesSquarePage hook.
 */
export type UseTimesSquarePageOptions = {
  /** Repertoire URL for service discovery */
  repertoireUrl?: string;
  /**
   * GitHub owner for a PR-preview page. When `owner`, `repo`, and `commit`
   * are all provided, the hook fetches the PR-preview endpoint instead of the
   * merged-page endpoint.
   */
  owner?: string | null;
  /** GitHub repository for a PR-preview page. */
  repo?: string | null;
  /** Git commit SHA for a PR-preview page. */
  commit?: string | null;
};

/**
 * Return type for useTimesSquarePage hook.
 */
export type UseTimesSquarePageReturn = {
  /** Full page metadata */
  page: Page | undefined;
  /** Page title */
  title: string | null;
  /** Page parameters JSON schema */
  parameters: Record<string, Record<string, unknown>> | null;
  /** Page description (formatted text) */
  description: FormattedText | null;
  /** URL to fetch rendered HTML */
  htmlUrl: string | null;
  /** URL to check HTML status */
  htmlStatusUrl: string | null;
  /** URL for SSE events */
  htmlEventsUrl: string | null;
  /** URL for rendered notebook download */
  renderedUrl: string | null;
  /** GitHub source metadata */
  github: GitHubSourceMetadata | null;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the page metadata */
  refetch: () => void;
};

/**
 * Fetch and access Times Square page metadata by GitHub display path.
 *
 * This hook fetches page metadata including parameters schema, URLs for
 * HTML rendering, and GitHub source information.
 *
 * When PR coordinates (`owner`, `repo`, `commit`) are all provided on the
 * options object, the hook fetches the PR-preview endpoint
 * (`GET /v1/github-pr/{owner}/{repo}/{commit}/{path}` under the Times Square
 * base URL), using `displayPath` as the repo-relative notebook `path`.
 * Otherwise it fetches the merged-page endpoint
 * (`GET /v1/github/{display_path}`).
 * Both endpoints return the identical `Page` model, so the return shape is
 * unchanged regardless of which branch is taken.
 *
 * @endpoint GET /times-square/v1/github/{display_path}
 * @endpoint GET /times-square/v1/github-pr/{owner}/{repo}/{commit}/{path}
 *
 * @param displayPath - GitHub display path (e.g., 'org/repo/dir/notebook').
 *   On PR-preview pages this doubles as the repo-relative notebook path.
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function NotebookViewer({ displayPath }: { displayPath: string }) {
 *   const { page, title, isLoading, error } = useTimesSquarePage(displayPath);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{title}</h1>
 *       <iframe src={page?.html_url} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useTimesSquarePage(
  displayPath: string,
  options?: UseTimesSquarePageOptions
): UseTimesSquarePageReturn {
  const { repertoireUrl, owner, repo, commit } = options ?? {};
  const timesSquareUrl = useTimesSquareUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl
    ? timesSquareUrl
    : DEFAULT_TIMES_SQUARE_URL;

  // When all three PR coordinates are present, fetch the PR-preview endpoint
  // using displayPath as the repo-relative notebook path; otherwise fall back
  // to the merged-page endpoint. Both endpoints return the same Page model.
  const isPrPage = !!owner && !!repo && !!commit;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    isPrPage
      ? githubPrPageQueryOptions(owner, repo, commit, displayPath, effectiveUrl)
      : githubPageQueryOptions(displayPath, effectiveUrl)
  );

  return {
    page: data,
    title: data?.title ?? null,
    parameters: data?.parameters ?? null,
    description: data?.description ?? null,
    htmlUrl: data?.html_url ?? null,
    htmlStatusUrl: data?.html_status_url ?? null,
    htmlEventsUrl: data?.html_events_url ?? null,
    renderedUrl: data?.rendered_url ?? null,
    github: data?.github ?? null,
    isLoading,
    isPending,
    error: error ?? null,
    refetch,
  };
}
