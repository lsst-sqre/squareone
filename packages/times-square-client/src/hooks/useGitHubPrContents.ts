'use client';

/**
 * Hook for fetching GitHub PR contents and check status.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TIMES_SQUARE_URL } from '../client';
import { githubPrContentsQueryOptions } from '../query-options';
import type { ContentNode, GitHubCheckRunSummary, GitHubPr } from '../schemas';

import { useTimesSquareUrl } from './useTimesSquareUrl';

/**
 * Options for useGitHubPrContents hook.
 */
export type UseGitHubPrContentsOptions = {
  /** Repertoire URL for service discovery */
  repertoireUrl?: string;
};

/**
 * Return type for useGitHubPrContents hook.
 */
export type UseGitHubPrContentsReturn = {
  /** Hierarchical tree of PR contents */
  contents: ContentNode[];
  /** Pull requests associated with this commit */
  pullRequests: GitHubPr[];
  /** YAML validation check status */
  yamlCheck: GitHubCheckRunSummary | null;
  /** Notebook execution check status */
  nbCheck: GitHubCheckRunSummary | null;
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
 * Fetch GitHub PR contents and check status.
 *
 * This hook fetches the contents tree for a specific PR commit, including
 * the status of YAML validation and notebook execution checks.
 *
 * The hook is disabled when any of owner, repo, or commit are missing.
 *
 * @endpoint GET /times-square/v1/github-pr/{owner}/{repo}/{commit}
 *
 * @param owner - GitHub owner (organization or username)
 * @param repo - GitHub repository name
 * @param commit - Git commit SHA
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function PrPreviewPage({ owner, repo, commit }: Props) {
 *   const {
 *     contents,
 *     pullRequests,
 *     yamlCheck,
 *     nbCheck,
 *     isLoading,
 *   } = useGitHubPrContents(owner, repo, commit);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <CheckStatus check={yamlCheck} label="YAML" />
 *       <CheckStatus check={nbCheck} label="Execution" />
 *       <PrList pullRequests={pullRequests} />
 *       <NavigationTree contents={contents} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useGitHubPrContents(
  owner?: string,
  repo?: string,
  commit?: string,
  options?: UseGitHubPrContentsOptions
): UseGitHubPrContentsReturn {
  const { repertoireUrl } = options ?? {};
  const timesSquareUrl = useTimesSquareUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl
    ? timesSquareUrl
    : DEFAULT_TIMES_SQUARE_URL;

  // Only enable the query when all required parameters are present
  const enabled = !!owner && !!repo && !!commit;

  const { data, error, isPending, isLoading, refetch } = useQuery({
    ...githubPrContentsQueryOptions(
      owner ?? '',
      repo ?? '',
      commit ?? '',
      effectiveUrl
    ),
    enabled,
  });

  return {
    contents: data?.contents ?? [],
    pullRequests: data?.pull_requests ?? [],
    yamlCheck: data?.yaml_check ?? null,
    nbCheck: data?.nbexec_check ?? null,
    isLoading,
    isPending,
    error: error ?? null,
    refetch,
  };
}
