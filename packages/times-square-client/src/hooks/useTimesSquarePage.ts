'use client';

/**
 * Hook for fetching Times Square page metadata.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TIMES_SQUARE_URL } from '../client';
import { githubPageQueryOptions } from '../query-options';
import type { FormattedText, GitHubSourceMetadata, Page } from '../schemas';

import { useTimesSquareUrl } from './useTimesSquareUrl';

/**
 * Options for useTimesSquarePage hook.
 */
export type UseTimesSquarePageOptions = {
  /** Repertoire URL for service discovery */
  repertoireUrl?: string;
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
 * @endpoint GET /times-square/v1/github/{display_path}
 *
 * @param displayPath - GitHub display path (e.g., 'org/repo/dir/notebook')
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
  const { repertoireUrl } = options ?? {};
  const timesSquareUrl = useTimesSquareUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl
    ? timesSquareUrl
    : DEFAULT_TIMES_SQUARE_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    githubPageQueryOptions(displayPath, effectiveUrl)
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
