/*
 * Context provider for the Times Square /pages/:page/html/events endpoint.
 */

import React from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';

export const TimesSquareHtmlEventsContext = React.createContext();

export default function TimesSquareHtmlEventsProvider({ children }) {
  const [htmlEvent, setHtmlEvent] = React.useState(null);

  const urlParameters = React.useContext(TimesSquareUrlParametersContext);
  const timesSquarePage = useTimesSquarePage();

  const urlQueryString = urlParameters.urlQueryString;
  const htmlEventsUrl = timesSquarePage.htmlEventsUrl;
  const fullHtmlEventsUrl = htmlEventsUrl
    ? `${htmlEventsUrl}?${urlQueryString}`
    : null;

  React.useEffect(() => {
    const abortController = new AbortController();

    async function runEffect() {
      if (htmlEventsUrl) {
        await fetchEventSource(fullHtmlEventsUrl, {
          method: 'GET',
          signal: abortController.signal,
          onopen(res) {
            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
              console.log(`Client side error ${fullHtmlEventsUrl}`, res);
            }
          },
          onmessage(event) {
            let parsedData;
            try {
              parsedData = JSON.parse(event.data);
            } catch (error) {
              return;
            }
            setHtmlEvent(parsedData);
          },
          onclose() {},
          onerror(err) {},
        });
      }
    }
    runEffect();

    return () => {
      // Clean up: close the event source connection
      abortController.abort();
    };
  }, [fullHtmlEventsUrl, htmlEventsUrl]);

  const contextValue = {
    dateSubmitted: htmlEvent ? htmlEvent.date_submitted : null,
    dateStarted: htmlEvent ? htmlEvent.date_started : null,
    dateFinished: htmlEvent ? htmlEvent.date_finished : null,
    executionStatus: htmlEvent ? htmlEvent.execution_status : null,
    executionDuration: htmlEvent ? htmlEvent.execution_duration : null,
    htmlHash: htmlEvent ? htmlEvent.html_hash : null,
    htmlUrl: htmlEvent ? htmlEvent.html_url : null,
  };

  return (
    <TimesSquareHtmlEventsContext.Provider value={{ ...contextValue }}>
      {children}
    </TimesSquareHtmlEventsContext.Provider>
  );
}
