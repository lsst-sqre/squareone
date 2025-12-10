/*
 * Client-only TimesSquareGitHubPagePanel component - uses SWR without SSR conflicts
 * This component handles the useTimesSquarePage hook on the client side only.
 */

import NextError from 'next/error';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useAppConfig } from '../../contexts/AppConfigContext';
import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import TimesSquareParameters from '../TimesSquareParameters';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import ExecStats from './ExecStats';
import GitHubEditLink from './GitHubEditLink';
import IpynbDownloadLink from './IpynbDownloadLink';
import styles from './TimesSquareGitHubPagePanelClient.module.css';

export default function TimesSquareGitHubPagePanelClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { siteName } = useAppConfig();
  const context = React.useContext(TimesSquareUrlParametersContext);
  if (!context) {
    throw new Error(
      'TimesSquareUrlParametersContext must be used within a provider'
    );
  }
  const { urlQueryString } = context;
  const pageData = useTimesSquarePage();

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (pageData.loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }
  if (pageData.error) {
    return <NextError statusCode={404} />;
  }

  const { title, description } = pageData;

  const ipynbDownloadUrl = `${pageData.renderedIpynbUrl}?${urlQueryString}`;

  return (
    <div className={styles.container}>
      <Head>
        <title>{`${title} | ${siteName}`}</title>
      </Head>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && (
          <div dangerouslySetInnerHTML={{ __html: description.html }} />
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
    </div>
  );
}
