/*
 * Client-only TimesSquareNotebookViewer component - handles notebook iframe on client side only.
 */

import {
  useHtmlStatus,
  useTimesSquarePage,
} from '@lsst-sqre/times-square-client';
import { useContext, useEffect, useState } from 'react';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
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
  const { githubSlug, notebookParameters, displaySettings, tsPageUrl } =
    context;

  // First get page metadata to get htmlStatusUrl
  const { htmlStatusUrl } = useTimesSquarePage(githubSlug ?? '', {
    repertoireUrl,
  });

  // Combine notebook params with display settings for the status URL
  const params: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(notebookParameters).map(([k, v]) => [k, String(v)])
    ),
    ...displaySettings,
  };

  // Use htmlStatusUrl directly with enhanced hook
  const { htmlAvailable, htmlUrl, iframeKey, isLoading, error } = useHtmlStatus(
    '', // pageName not needed when using htmlStatusUrl
    params,
    { htmlStatusUrl: htmlStatusUrl ?? undefined }
  );

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
