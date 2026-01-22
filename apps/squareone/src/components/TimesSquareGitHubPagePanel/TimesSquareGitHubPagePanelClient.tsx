/*
 * Client-only TimesSquareGitHubPagePanel component - handles page panel on client side only.
 */

import { useTimesSquarePage } from '@lsst-sqre/times-square-client';
import NextError from 'next/error';
import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
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

  const { siteName } = useStaticConfig();
  const repertoireUrl = useRepertoireUrl();
  const context = useContext(TimesSquareUrlParametersContext);
  if (!context) {
    throw new Error(
      'TimesSquareUrlParametersContext must be used within a provider'
    );
  }
  const { urlQueryString, githubSlug } = context;
  const { title, description, renderedUrl, github, isLoading, error } =
    useTimesSquarePage(githubSlug ?? '', { repertoireUrl });

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return <NextError statusCode={404} />;
  }

  const ipynbDownloadUrl = `${renderedUrl}?${urlQueryString}`;

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
          owner={github?.owner ?? null}
          repository={github?.repository ?? null}
          sourcePath={github?.source_path ?? null}
        />

        <TimesSquareParameters />

        <IpynbDownloadLink
          url={ipynbDownloadUrl}
          sourcePath={github?.source_path ?? null}
        />

        <ExecStats />
      </div>
    </div>
  );
}
