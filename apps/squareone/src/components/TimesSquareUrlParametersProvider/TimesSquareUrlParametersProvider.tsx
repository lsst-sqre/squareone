/*
 * Context provider for the current page's notebook and display parameters
 * that come from the URL path and query parameters.
 */

import React from 'react';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

type DisplaySettings = {
  ts_hide_code: string;
};

type TimesSquareUrlParametersContextValue = {
  tsPageUrl: string;
  displaySettings: DisplaySettings;
  notebookParameters: Record<string, any>;
  owner: string | null;
  repo: string | null;
  commit: string | null;
  tsSlug: string[] | null;
  githubSlug: string | null;
  urlQueryString: string;
};

type TimesSquareUrlParametersProviderProps = {
  children: React.ReactNode;
};

export const TimesSquareUrlParametersContext = React.createContext<
  TimesSquareUrlParametersContextValue | undefined
>(undefined);

export default function TimesSquareUrlParametersProvider({
  children,
}: TimesSquareUrlParametersProviderProps) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();

  // Get components out of the URL path. Only /github-pr/ pages have owner,
  // repo, and commit components in the path. In /github/ pages the owner
  // and repo are part of tsSlug.
  const { tsSlug, owner = null, repo = null, commit = null } = router.query;

  // Since the page's path is a [...tsSlug], we need to join the parts of the
  // path to get the full slug. This combines the owner, repo, directory, and
  // notebook name for regular /github/ pages, or just the directory and
  // notebook name for /github-pr/ pages.
  const githubSlug = tsSlug ? (tsSlug as string[]).join('/') : null;

  // Construct the URL for the Times Square API endpoint that gives information
  // about the page. GitHub PR pages (github-pr) have different API URLs than
  // regular GitHub pages.
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

  const queryString = new URLSearchParams(
    userParameters as Record<string, string>
  ).toString();

  // pop display settings from the user parameters and to also separate out
  // the notebook parameters.
  const { ts_hide_code = '1', ...notebookParameters } = userParameters;
  const displaySettings: DisplaySettings = {
    ts_hide_code: ts_hide_code as string,
  };

  const contextValue: TimesSquareUrlParametersContextValue = {
    tsPageUrl,
    displaySettings,
    notebookParameters,
    owner: owner as string | null,
    repo: repo as string | null,
    commit: commit as string | null,
    tsSlug: tsSlug as string[] | null,
    githubSlug,
    urlQueryString: queryString,
  };

  return (
    <TimesSquareUrlParametersContext.Provider value={contextValue}>
      {children}
    </TimesSquareUrlParametersContext.Provider>
  );
}
