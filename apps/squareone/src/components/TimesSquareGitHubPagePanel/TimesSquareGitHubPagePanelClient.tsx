/*
 * Client-only TimesSquareGitHubPagePanel component - uses SWR without SSR conflicts
 * This component handles the useTimesSquarePage hook on the client side only.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Error from 'next/error';

import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import TimesSquareParameters from '../TimesSquareParameters';
import ExecStats from './ExecStats';
import GitHubEditLink from './GitHubEditLink';
import IpynbDownloadLink from './IpynbDownloadLink';
import { useAppConfig } from '../../contexts/AppConfigContext';

export default function TimesSquareGitHubPagePanelClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { siteName } = useAppConfig();
  const { urlQueryString } = React.useContext(TimesSquareUrlParametersContext)!;
  const pageData = useTimesSquarePage();

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <PagePanelContainer>
        <p>Loading...</p>
      </PagePanelContainer>
    );
  }

  if (pageData.loading) {
    return (
      <PagePanelContainer>
        <p>Loading...</p>
      </PagePanelContainer>
    );
  }
  if (pageData.error) {
    return <Error statusCode={404} />;
  }

  const { title, description } = pageData;

  const ipynbDownloadUrl = `${pageData.renderedIpynbUrl}?${urlQueryString}`;

  return (
    <PagePanelContainer>
      <Head>
        <title>{`${title} | ${siteName}`}</title>
      </Head>
      <div>
        <PageTitle>{title}</PageTitle>
        {description && (
          <div dangerouslySetInnerHTML={{ __html: description }}></div>
        )}
        <GitHubEditLink
          owner={pageData.github.owner}
          repository={pageData.github.repository}
          sourcePath={pageData.github.sourcePath}
        />

        <TimesSquareParameters />

        <IpynbDownloadLink
          url={ipynbDownloadUrl}
          sourcePath={pageData.github.sourcePath}
        />

        <ExecStats />
      </div>
    </PagePanelContainer>
  );
}

const PagePanelContainer = styled.div`
  padding: 1em;
  margin-right: calc(-1 * var(--size-screen-padding-min));
  border-radius: 15px 0 0 15px;
  margin-top: 1em;
  border: 1px solid var(--rsd-color-primary-600);
  border-right: none;
  box-shadow: var(--sqo-elevation-base);
`;

const PageTitle = styled.h1`
  margin-top: 0;
`;
