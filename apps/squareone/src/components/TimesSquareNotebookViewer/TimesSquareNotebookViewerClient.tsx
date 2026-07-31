/*
 * Client-only TimesSquareNotebookViewer component - handles notebook iframe on client side only.
 */

import {
  useHtmlStatus,
  useRerunPage,
  useTimesSquarePage,
} from '@lsst-sqre/times-square-client';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { makeReportError } from '@/lib/sentry/reportError';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import NotebookExecutionError from './NotebookExecutionError';
import styles from './TimesSquareNotebookViewerClient.module.css';

export default function TimesSquareNotebookViewerClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const repertoireUrl = useRepertoireUrl();
  const context = useContext(TimesSquareUrlParametersContext);
  if (!context) {
    throw new Error(
      'TimesSquareUrlParametersContext must be used within a provider'
    );
  }
  const {
    githubSlug,
    notebookParameters,
    displaySettings,
    tsPageUrl,
    owner,
    repo,
    commit,
  } = context;

  // First get page metadata to get htmlStatusUrl
  const { htmlStatusUrl, htmlUrl: pageHtmlUrl } = useTimesSquarePage(
    githubSlug ?? '',
    {
      repertoireUrl,
      owner,
      repo,
      commit,
    }
  );

  // Combine notebook params with display settings for the status URL. Memoized
  // so the re-run callback below keeps a stable identity across renders.
  const params: Record<string, string> = useMemo(
    () => ({
      ...Object.fromEntries(
        Object.entries(notebookParameters).map(([k, v]) => [k, String(v)])
      ),
      ...displaySettings,
    }),
    [notebookParameters, displaySettings]
  );

  // Use htmlStatusUrl directly with enhanced hook
  const {
    htmlAvailable,
    htmlUrl,
    iframeKey,
    isLoading,
    error,
    executionError,
  } = useHtmlStatus(
    '', // pageName not needed when using htmlStatusUrl
    params,
    { htmlStatusUrl: htmlStatusUrl ?? undefined }
  );

  // A re-run soft-deletes this page instance's cached rendering, which clears
  // the terminal execution error server-side. The mutation invalidates the
  // html-status queries on success, so the viewer drops back to its loading
  // state and the package resumes polling without any extra wiring here.
  const {
    rerunPageAsync,
    isPending: rerunPending,
    isError: rerunFailed,
  } = useRerunPage({ repertoireUrl });

  // Inject the app's Sentry-backed reporter so a report-worthy re-run failure
  // (5xx, network error) reaches Sentry with site context tags. The mutation
  // hook is deliberately Sentry-agnostic, so reporting stays at the call site.
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);

  const handleRerun = useCallback(async () => {
    if (!pageHtmlUrl) {
      return;
    }

    // The page metadata's `html_url` is parameter-free, so the page instance's
    // parameters are appended here — mirroring how the html-status URL from the
    // same metadata is parameterized for polling.
    try {
      await rerunPageAsync({ htmlUrl: pageHtmlUrl, params });
    } catch (err) {
      reportError(err, {
        site: 'times-square-rerun',
        package: 'times-square-client',
      });
    }
  }, [pageHtmlUrl, params, rerunPageAsync, reportError]);

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error contacting API at {`${tsPageUrl}`}</p>
      </div>
    );
  }

  // A non-null execution error is terminal: the package has already stopped
  // polling, so the loading state would never resolve. Show the API's own
  // failure copy and offer a re-run instead.
  if (executionError) {
    return (
      <NotebookExecutionError
        executionError={executionError}
        onRerun={handleRerun}
        isRerunPending={rerunPending}
        rerunFailed={rerunFailed}
      />
    );
  }

  if (isLoading || !htmlAvailable) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <iframe
      className={styles.iframe}
      src={htmlUrl ?? undefined}
      key={iframeKey}
      title="Notebook viewer"
    />
  );
}
