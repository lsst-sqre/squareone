/*
 * Client-only TimesSquareNotebookViewer component - uses SWR without SSR conflicts
 * This component handles the useHtmlStatus hook on the client side only.
 */

import React, { useEffect, useState } from 'react';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import styles from './TimesSquareNotebookViewerClient.module.css';
import useHtmlStatus from './useHtmlStatus';

export default function TimesSquareNotebookViewerClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const context = React.useContext(TimesSquareUrlParametersContext);
  if (!context) {
    throw new Error(
      'TimesSquareUrlParametersContext must be used within a provider'
    );
  }
  const { tsPageUrl } = context;
  const htmlStatus = useHtmlStatus();

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (htmlStatus.error) {
    return (
      <div>
        <p>Error contacting API at {`${tsPageUrl}`}</p>
      </div>
    );
  }

  if (htmlStatus.loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <iframe
      className={styles.iframe}
      src={htmlStatus.htmlUrl}
      key={htmlStatus.iframeKey}
      title="Notebook viewer"
    />
  );
}
