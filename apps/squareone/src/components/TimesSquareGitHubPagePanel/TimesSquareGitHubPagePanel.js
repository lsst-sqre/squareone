/*
 * The TimesSquarePage is a view into a single Times Square page.
 * It consists of a column with page metadata/settings and another column with
 * the notebook content (NotebookIframe).
 */

import React from 'react';
import styled from 'styled-components';
import getConfig from 'next/config';
import Head from 'next/head';
import Error from 'next/error';

import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import TimesSquareParameters from '../TimesSquareParameters';
import ExecStats from './ExecStats';
import GitHubEditLink from './GitHubEditLink';
import IpynbDownloadLink from './IpynbDownloadLink';

export default function TimesSquareGitHubPagePanel({}) {
  const { publicRuntimeConfig } = getConfig();
  const { urlQueryString } = React.useContext(TimesSquareUrlParametersContext);
  const pageData = useTimesSquarePage();

  if (pageData.loading) {
    return <p>Loading...</p>;
  }
  if (pageData.error) {
    return <Error statusCode={404} />;
  }

  const { title, description } = pageData;

  const ipynbDownloadUrl = `${pageData.renderedIpynbUrl}?${urlQueryString}`;

  return (
    <PagePanelContainer>
      <Head>
        <title>{`${title} | ${publicRuntimeConfig.siteName}`}</title>
      </Head>
      <div>
        <PageTitle>{title}</PageTitle>
        {description && (
          <div dangerouslySetInnerHTML={{ __html: description.html }}></div>
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
