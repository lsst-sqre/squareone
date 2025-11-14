/*
 * useHtmlStatus hook fetches data from the Times Square
 * /v1/pages/:page/htmlstatus endpoint using the SWR hook to enable
 * dynamic refreshing of data about a page's HTML rendering.
 */

import React from 'react';
import useSWR from 'swr';
import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';

type HtmlStatusData = {
  available: boolean;
  html_hash: string;
  html_url: string;
};

type UseHtmlStatusReturn = {
  error: any;
  loading: boolean;
  htmlAvailable: boolean;
  htmlHash: string | null;
  htmlUrl: string | null;
  iframeKey: string;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export function parameterizeUrl(
  baseUrl: string,
  parameters: Record<string, any>,
  displaySettings: Record<string, any>
): string {
  const url = new URL(baseUrl);
  Object.entries(parameters).map((item) =>
    url.searchParams.set(item[0], item[1])
  );
  Object.entries(displaySettings).map((item) =>
    url.searchParams.set(item[0], item[1])
  );
  return url.toString();
}

function useHtmlStatus(): UseHtmlStatusReturn {
  const { notebookParameters: parameters, displaySettings } = React.useContext(
    TimesSquareUrlParametersContext
  )!;
  const pageData = useTimesSquarePage();

  const { data, error } = useSWR<HtmlStatusData>(
    () => parameterizeUrl(pageData.htmlStatusUrl!, parameters, displaySettings),
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
    iframeKey: data?.available ? data.html_hash : 'html-not-available',
  };
}

export default useHtmlStatus;
