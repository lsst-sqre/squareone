/*
 * Context provider for the current page's notebook and display parameters.
 */

import React from 'react';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

export const TimesSquareParametersContext = React.createContext();

export default function TimesSquareParametersProvider({ children }) {
  // const [displayParameters, setDisplayParameters] = React.useState({
  //   ts_hide_code: '1',
  // });
  // const [notebookParameters, setNotebookParameters] = React.useState({});

  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();

  // Get components out of the URL path
  const { tsSlug, owner = '', repo = '', commit = '' } = router.query;

  // Since the page's path is a [...tsSlug], we need to join the parts of the
  // path to get the full slug. This combines the owner, repo, directory, and
  // notebook name for regular /github/ pages, or just the directory and
  // notebook name for /github-pr/ pages.
  const githubSlug = tsSlug.join('/');

  // Construct the URL for the Times Square API endpoint
  const tsPageUrl = router.pathname.startsWith('/times-square/github-pr')
    ? `${timesSquareUrl}/v1/github-pr/${owner}/${repo}/${commit}/${githubSlug}`
    : `${timesSquareUrl}/v1/github/${githubSlug}`;

  // Get the user query parameters from the URL. In next 13 we can use the
  // useSearchParams hook (https://nextjs.org/docs/app/api-reference/functions/use-search-params)
  // to get these directly, but for now we have to filter them out of the
  // router.query object. Even if path components leak in, we can still filter
  // them out in the UI for setting parameters because we only show parameters
  // matching the parameter schema.
  const userParameters = Object.fromEntries(
    Object.entries(router.query)
      .filter((item) => item[0] != 'tsSlug')
      .map((item) => item)
  );

  // pop display settings from the user parameters and to also separate out
  // the notebook parameters.
  const { ts_hide_code = '1', ...notebookParameters } = userParameters;
  const displaySettings = { ts_hide_code };

  return (
    <TimesSquareParametersContext.Provider
      value={{ tsPageUrl, displaySettings, notebookParameters }}
    >
      {children}
    </TimesSquareParametersContext.Provider>
  );
}
