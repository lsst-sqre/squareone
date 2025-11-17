/*
 * Get the contents listing for GitHub-backed repos from the Times Square API.
 */

import useSWR from 'swr';

type ContentNode = {
  node_type: 'owner' | 'repo' | 'dir' | 'page';
  title: string;
  path: string;
  contents: ContentNode[];
};

type GitHubContentsListingData = {
  contents: ContentNode[];
};

type UseGitHubContentsListingReturn = {
  error: unknown;
  loading: boolean;
  contents: ContentNode[];
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

function useGitHubContentsListing(
  timesSquareUrl: string
): UseGitHubContentsListingReturn {
  const contentsUrl = `${timesSquareUrl}/v1/github`;
  const { data, error } = useSWR<GitHubContentsListingData>(
    contentsUrl,
    fetcher,
    {}
  );

  return {
    error: error,
    loading: !error && !data,
    contents: data ? data.contents : [],
  };
}

export default useGitHubContentsListing;
