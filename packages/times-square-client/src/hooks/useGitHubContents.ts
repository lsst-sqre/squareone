'use client';

/**
 * Hook for fetching the GitHub contents tree.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TIMES_SQUARE_URL } from '../client';
import { githubContentsQueryOptions } from '../query-options';
import type { ContentNode } from '../schemas';

import { useTimesSquareUrl } from './useTimesSquareUrl';

/**
 * Options for useGitHubContents hook.
 */
export type UseGitHubContentsOptions = {
  /** Repertoire URL for service discovery */
  repertoireUrl?: string;
};

/**
 * Return type for useGitHubContents hook.
 */
export type UseGitHubContentsReturn = {
  /** Hierarchical tree of GitHub contents */
  contents: ContentNode[];
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query is pending (initial load) */
  isPending: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the contents */
  refetch: () => void;
};

/**
 * Fetch the GitHub contents tree for navigation.
 *
 * This hook fetches the hierarchical tree of GitHub-backed notebook pages.
 * The tree structure includes owners (organizations), repositories,
 * directories, and pages.
 *
 * @endpoint GET /times-square/v1/github
 *
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function NavigationTree() {
 *   const { contents, isLoading, error } = useGitHubContents();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {contents.map((node) => (
 *         <TreeNode key={node.path} node={node} />
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useGitHubContents(
  options?: UseGitHubContentsOptions
): UseGitHubContentsReturn {
  const { repertoireUrl } = options ?? {};
  const timesSquareUrl = useTimesSquareUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl
    ? timesSquareUrl
    : DEFAULT_TIMES_SQUARE_URL;

  const { data, error, isPending, isLoading, refetch } = useQuery(
    githubContentsQueryOptions(effectiveUrl)
  );

  return {
    contents: data?.contents ?? [],
    isLoading,
    isPending,
    error: error ?? null,
    refetch,
  };
}
