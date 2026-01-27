/*
 * Client-only TimesSquareHtmlEventsProvider component - handles SSE events on client side only.
 */

import { useTimesSquarePage } from '@lsst-sqre/times-square-client';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import {
  TimesSquareHtmlEventsContext,
  type TimesSquareHtmlEventsContextValue,
} from './TimesSquareHtmlEventsProvider';

type HtmlEvent = {
  date_submitted: string;
  date_started: string;
  date_finished: string;
  execution_status: string;
  execution_duration: number;
  html_hash: string;
  html_url: string;
};

type TimesSquareHtmlEventsProviderClientProps = {
  children: ReactNode;
};

export default function TimesSquareHtmlEventsProviderClient({
  children,
}: TimesSquareHtmlEventsProviderClientProps) {
  const [isClient, setIsClient] = useState(false);
  const [htmlEvent, setHtmlEvent] = useState<HtmlEvent | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const repertoireUrl = useRepertoireUrl();
  const urlParameters = useContext(TimesSquareUrlParametersContext);
  const githubSlug = urlParameters?.githubSlug ?? '';
  const { htmlEventsUrl } = useTimesSquarePage(githubSlug, { repertoireUrl });

  const urlQueryString = urlParameters?.urlQueryString;
  const fullHtmlEventsUrl = htmlEventsUrl
    ? `${htmlEventsUrl}?${urlQueryString}`
    : null;

  useEffect(() => {
    // Don't run SSE on server side
    if (!isClient) return () => {};

    const abortController = new AbortController();

    async function runEffect(): Promise<void> {
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
            } catch (_error) {
              return;
            }
            setHtmlEvent(parsedData);

            if (
              parsedData.execution_status === 'complete' &&
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
  }, [fullHtmlEventsUrl, htmlEventsUrl, isClient]);

  const contextValue = useMemo(
    (): TimesSquareHtmlEventsContextValue => ({
      dateSubmitted: htmlEvent ? htmlEvent.date_submitted : null,
      dateStarted: htmlEvent ? htmlEvent.date_started : null,
      dateFinished: htmlEvent ? htmlEvent.date_finished : null,
      executionStatus: htmlEvent ? htmlEvent.execution_status : null,
      executionDuration: htmlEvent ? htmlEvent.execution_duration : null,
      htmlHash: htmlEvent ? htmlEvent.html_hash : null,
      htmlUrl: htmlEvent ? htmlEvent.html_url : null,
    }),
    [htmlEvent]
  );

  return (
    <TimesSquareHtmlEventsContext.Provider value={contextValue}>
      {children}
    </TimesSquareHtmlEventsContext.Provider>
  );
}
