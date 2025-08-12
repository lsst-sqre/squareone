/*
 * Get the contents listing for a GitHub PR from the Times Square API.
 */

import useSWR from 'swr';

type GitHubContributor = {
  username: string;
  avatar_url: string;
  html_url: string;
};

type PullRequest = {
  number: number;
  state: 'open' | 'draft' | 'merged' | 'closed';
  conversation_url: string;
  title: string;
  contributor: GitHubContributor;
};

type GitHubCheck = {
  status: 'queued' | 'in_progress' | 'completed';
  report_title: string;
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'timed_out'
    | 'action_required'
    | 'stale'
    | null;
  html_url: string;
};

type GitHubPrContentsData = {
  contents: any[];
  pull_requests: PullRequest[];
  yaml_check?: GitHubCheck;
  nbexec_check?: GitHubCheck;
};

type UseGitHubPrContentsListingReturn = {
  error: any;
  loading: boolean;
  contents: any[];
  pullRequests: PullRequest[];
  yamlCheck?: GitHubCheck;
  nbCheck?: GitHubCheck;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

function useGitHubPrContentsListing(
  timesSquareUrl?: string,
  owner?: string,
  repo?: string,
  commitSha?: string
): UseGitHubPrContentsListingReturn {
  const contentsUrl =
    timesSquareUrl && owner && repo && commitSha
      ? `${timesSquareUrl}/v1/github-pr/${owner}/${repo}/${commitSha}`
      : null;

  const { data, error } = useSWR<GitHubPrContentsData>(
    contentsUrl,
    fetcher,
    {}
  );

  return {
    error: error,
    loading: !error && !data,
    contents: data ? data.contents : [],
    pullRequests: data ? data.pull_requests : [],
    yamlCheck: data ? data.yaml_check : undefined,
    nbCheck: data ? data.nbexec_check : undefined,
  };
}

export default useGitHubPrContentsListing;
