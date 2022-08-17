/*
 * Get the contents listing for a GitHub PR from the Times Square API.
 */

import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function useGitHubPrContentsListing(timesSquareUrl, owner, repo, commitSha) {
  const contentsUrl = `${timesSquareUrl}/v1/github-pr/${owner}/${repo}/${commitSha}`;
  const { data, error } = useSWR(contentsUrl, fetcher, {});

  return {
    error: error,
    loading: !error && !data,
    contents: data ? data.contents : [],
    pullRequests: data ? data.pull_requests : [],
    yamlCheck: data ? data.yaml_check : {},
    nbCheck: data ? data.nbexec_check : {},
  };
}

export default useGitHubPrContentsListing;
