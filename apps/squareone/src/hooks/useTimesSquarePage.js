import React from 'react';
import useSWR from 'swr';

import { TimesSquareUrlParametersContext } from '../components/TimesSquareUrlParametersProvider';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function useTimesSquarePage() {
  const { tsPageUrl } = React.useContext(TimesSquareUrlParametersContext);
  const { data, error } = useSWR(tsPageUrl, fetcher);

  const githubInfo = {
    owner: data.github.owner ? data.github.owner : null,
    repository: data.github.repository ? data.github.repository : null,
    sourcePath: data.github.source_path ? data.github.source_path : null,
    sidecarPath: data.github.sidecar_path ? data.github.sidecar_path : null,
  };

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
