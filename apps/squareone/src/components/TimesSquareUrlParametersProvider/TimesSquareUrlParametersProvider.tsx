/*
 * Context provider for the current page's notebook and display parameters
 * that come from the URL path and query parameters.
 *
 * This provider uses Next.js App Router navigation APIs (useParams, usePathname,
 * useSearchParams) instead of Pages Router's useRouter.
 *
 * Note: useSearchParams() requires a Suspense boundary. The parent App Router
 * page/layout should provide this boundary.
 */

'use client';

import { useParams, usePathname, useSearchParams } from 'next/navigation';
import React, { type ReactNode, useMemo } from 'react';

import { useStaticConfig } from '../../hooks/useStaticConfig';

type DisplaySettings = {
  ts_hide_code: string;
};

type TimesSquareUrlParametersContextValue = {
  tsPageUrl: string;
  displaySettings: DisplaySettings;
  // biome-ignore lint/suspicious/noExplicitAny: Notebook parameters from URL can be any type (string, number, boolean, etc.)
  notebookParameters: Record<string, any>;
  owner: string | null;
  repo: string | null;
  commit: string | null;
  tsSlug: string[] | null;
  githubSlug: string | null;
  urlQueryString: string;
};

type TimesSquareUrlParametersProviderProps = {
  children: ReactNode;
};

export const TimesSquareUrlParametersContext = React.createContext<
  TimesSquareUrlParametersContextValue | undefined
>(undefined);

export default function TimesSquareUrlParametersProvider({
  children,
}: TimesSquareUrlParametersProviderProps) {
  const { timesSquareUrl } = useStaticConfig();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const contextValue = useMemo(() => {
    // Extract route params
    // Route: /times-square/github/[...tsSlug]
    // Route: /times-square/github-pr/[owner]/[repo]/[commit]/[...tsSlug]
    const tsSlug = (params?.tsSlug as string[] | undefined) ?? null;
    const owner = (params?.owner as string | undefined) ?? null;
    const repo = (params?.repo as string | undefined) ?? null;
    const commit = (params?.commit as string | undefined) ?? null;

    // Join the slug parts to get the full GitHub slug
    // For /github/ pages: owner/repo/directory/notebook
    // For /github-pr/ pages: directory/notebook (owner/repo/commit are separate params)
    const githubSlug = tsSlug ? tsSlug.join('/') : null;

    // Determine page type from pathname
    const isPrPage = pathname?.startsWith('/times-square/github-pr') ?? false;

    // Construct the URL for the Times Square API endpoint
    const tsPageUrl = isPrPage
      ? `${timesSquareUrl}/v1/github-pr/${owner}/${repo}/${commit}/${githubSlug}`
      : `${timesSquareUrl}/v1/github/${githubSlug}`;

    // Extract query parameters from searchParams
    // In App Router, searchParams only contains query string params (not path params)
    const userParameters: Record<string, string> = {};
    searchParams?.forEach((value, key) => {
      userParameters[key] = value;
    });

    const queryString = searchParams?.toString() ?? '';

    // Separate display settings from notebook parameters
    const { ts_hide_code = '1', ...notebookParameters } = userParameters;
    const displaySettings = {
      ts_hide_code,
    };

    return {
      tsPageUrl,
      displaySettings,
      notebookParameters,
      owner,
      repo,
      commit,
      tsSlug,
      githubSlug,
      urlQueryString: queryString,
    };
  }, [params, pathname, searchParams, timesSquareUrl]);

  return (
    <TimesSquareUrlParametersContext.Provider value={contextValue}>
      {children}
    </TimesSquareUrlParametersContext.Provider>
  );
}
