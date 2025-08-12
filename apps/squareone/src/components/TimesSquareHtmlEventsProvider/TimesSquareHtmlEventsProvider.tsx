/*
 * Context provider for the Times Square /pages/:page/html/events endpoint.
 */

import React from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';

type HtmlEvent = {
  date_submitted: string;
  date_started: string;
  date_finished: string;
  execution_status: string;
  execution_duration: number;
  html_hash: string;
  html_url: string;
};

type TimesSquareHtmlEventsContextValue = {
  dateSubmitted: string | null;
  dateStarted: string | null;
  dateFinished: string | null;
  executionStatus: string | null;
  executionDuration: number | null;
  htmlHash: string | null;
  htmlUrl: string | null;
};

type TimesSquareHtmlEventsProviderProps = {
  children: React.ReactNode;
};

export const TimesSquareHtmlEventsContext = React.createContext<
  TimesSquareHtmlEventsContextValue | undefined
>(undefined);

export default function TimesSquareHtmlEventsProvider({
  children,
}: TimesSquareHtmlEventsProviderProps) {
  const [htmlEvent, setHtmlEvent] = React.useState<HtmlEvent | null>(null);

  const urlParameters = React.useContext(TimesSquareUrlParametersContext);
  const timesSquarePage = useTimesSquarePage();

  const urlQueryString = urlParameters?.urlQueryString;
  const htmlEventsUrl = timesSquarePage.htmlEventsUrl;
  const fullHtmlEventsUrl = htmlEventsUrl
    ? `${htmlEventsUrl}?${urlQueryString}`
    : null;

  React.useEffect(() => {
    const abortController = new AbortController();

    async function runEffect() {
      if (htmlEventsUrl && fullHtmlEventsUrl) {
        await fetchEventSource(fullHtmlEventsUrl, {
          method: 'GET',
          signal: abortController.signal,
          async onopen(res) {
            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
              console.error(`Client side error ${fullHtmlEventsUrl}`, res);
            }
          },
          onmessage(event) {
            let parsedData: HtmlEvent;
            try {
              parsedData = JSON.parse(event.data);
            } catch (error) {
              return;
            }
            setHtmlEvent(parsedData);

            if (
              parsedData.execution_status == 'complete' &&
              parsedData.html_hash
            ) {
              abortController.abort();
            }
          },
          onclose() {},
          onerror(err) {
            console.error(
              `Error fetching Times Square events SSE ${fullHtmlEventsUrl}`,
              err
            );
          },
        });
      }
    }
    runEffect();

    return () => {
      // Clean up: close the event source connection
      abortController.abort();
    };
  }, [fullHtmlEventsUrl, htmlEventsUrl]);

  const contextValue: TimesSquareHtmlEventsContextValue = {
    dateSubmitted: htmlEvent ? htmlEvent.date_submitted : null,
    dateStarted: htmlEvent ? htmlEvent.date_started : null,
    dateFinished: htmlEvent ? htmlEvent.date_finished : null,
    executionStatus: htmlEvent ? htmlEvent.execution_status : null,
    executionDuration: htmlEvent ? htmlEvent.execution_duration : null,
    htmlHash: htmlEvent ? htmlEvent.html_hash : null,
    htmlUrl: htmlEvent ? htmlEvent.html_url : null,
  };

  return (
    <TimesSquareHtmlEventsContext.Provider value={contextValue}>
      {children}
    </TimesSquareHtmlEventsContext.Provider>
  );
}
