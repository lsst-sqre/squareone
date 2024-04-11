import React from 'react';
import useSWR from 'swr';

import { TimesSquareUrlParametersContext } from '../components/TimesSquareUrlParametersProvider';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function useTimesSquarePage() {
  const { tsPageUrl } = React.useContext(TimesSquareUrlParametersContext);
  const { data, error } = useSWR(tsPageUrl, fetcher);

  return {
    error: error,
    loading: !error && !data,
    title: data ? data.title : null,
    parameters: data ? data.parameters : null,
    description: data ? data.description : null,
    htmlUrl: data ? data.html_url : null,
    htmlStatusUrl: data ? data.html_status_url : null,
    htmlEventsUrl: data ? data.html_events_url : null,
  };
}

export default useTimesSquarePage;
