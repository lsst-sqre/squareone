/*
 * Client-only TimesSquareNotebookViewer component - uses SWR without SSR conflicts
 * This component handles the useHtmlStatus hook on the client side only.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import useHtmlStatus from './useHtmlStatus';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';

const StyledIframe = styled.iframe`
  border: 0px solid black;
  width: 100%;
  height: 100%;
`;

export default function TimesSquareNotebookViewerClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { tsPageUrl } = React.useContext(TimesSquareUrlParametersContext)!;
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
    <StyledIframe
      src={htmlStatus.htmlUrl}
      key={htmlStatus.iframeKey}
    ></StyledIframe>
  );
}
