/*
 * useHtmlStatus hook fetches data from the Times Square
 * /v1/pages/:page/htmlstatus endpoint using the SWR hook to enable
 * dynamic refreshing of data about a page's HTML rendering.
 */

import useSWR from 'swr';
import useTimesSquarePage from '../../hooks/useTimesSquarePage';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function parameterizeUrl(baseUrl, parameters, displaySettings) {
  const url = new URL(baseUrl);
  Object.entries(parameters).map((item) =>
    url.searchParams.set(item[0], item[1])
  );
  Object.entries(displaySettings).map((item) =>
    url.searchParams.set(item[0], item[1])
  );
  return url.toString();
}

function useHtmlStatus(pageUrl, parameters, displaySettings) {
  const pageData = useTimesSquarePage(pageUrl);

  const { data, error } = useSWR(
    () => parameterizeUrl(pageData.htmlStatusUrl, parameters, displaySettings),
    fetcher,
    {
      // ping every 1 second while browser in focus.
      // TODO back this off once HTML is loaded?
      refreshInterval: 1000,
    }
  );

  return {
    error: error,
    loading: !error && !data,
    htmlAvailable: data ? data.available : false,
    htmlHash: data ? data.html_hash : null,
    htmlUrl: data ? data.html_url : null,
    iframeKey: data && data.available ? data.html_hash : 'html-not-available',
  };
}

export default useHtmlStatus;
