/*
 * Get the contents listing for GitHub-backed repos from the Times Square API.
 */

import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function useGitHubContentsListing(timesSquareUrl) {
  const contentsUrl = `${timesSquareUrl}/v1/github`;
  const { data, error } = useSWR(contentsUrl, fetcher, {});

  return {
    error: error,
    loading: !error && !data,
    contents: data ? data.contents : [],
  };
}

export default useGitHubContentsListing;
