import React from 'react';
import useSWR from 'swr';

import { TimesSquareUrlParametersContext } from '../components/TimesSquareUrlParametersProvider';

type TimesSquarePageData = {
  title: string;
  parameters: any;
  description: string;
  html_url: string;
  html_status_url: string;
  html_events_url: string;
  rendered_url: string;
  github: {
    owner: string;
    repository: string;
    source_path: string;
    sidecar_path: string;
  };
};

type GitHubInfo = {
  owner: string | null;
  repository: string | null;
  sourcePath: string | null;
  sidecarPath: string | null;
};

type UseTimesSquarePageReturn = {
  error: any;
  loading: boolean;
  title: string | null;
  parameters: any | null;
  description: string | null;
  htmlUrl: string | null;
  htmlStatusUrl: string | null;
  htmlEventsUrl: string | null;
  renderedIpynbUrl: string | null;
  github: GitHubInfo;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

function useTimesSquarePage(): UseTimesSquarePageReturn {
  const { tsPageUrl } = React.useContext(TimesSquareUrlParametersContext);
  const { data, error } = useSWR<TimesSquarePageData>(tsPageUrl, fetcher);

  const githubInfo: GitHubInfo = data
    ? {
        owner: data.github.owner ? data.github.owner : null,
        repository: data.github.repository ? data.github.repository : null,
        sourcePath: data.github.source_path ? data.github.source_path : null,
        sidecarPath: data.github.sidecar_path ? data.github.sidecar_path : null,
      }
    : { owner: null, repository: null, sourcePath: null, sidecarPath: null };

  return {
    error: error,
    loading: !error && !data,
    title: data ? data.title : null,
    parameters: data ? data.parameters : null,
    description: data ? data.description : null,
    htmlUrl: data ? data.html_url : null,
    htmlStatusUrl: data ? data.html_status_url : null,
    htmlEventsUrl: data ? data.html_events_url : null,
    renderedIpynbUrl: data ? data.rendered_url : null,
    github: githubInfo,
  };
}

export default useTimesSquarePage;
