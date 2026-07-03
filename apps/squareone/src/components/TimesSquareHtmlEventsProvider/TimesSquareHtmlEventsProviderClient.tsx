/*
 * Client-only TimesSquareHtmlEventsProvider component - handles SSE events on client side only.
 *
 * The SSE transport lives in @lsst-sqre/times-square-client's
 * subscribeToHtmlEvents (built on @lsst-sqre/sse-client), which owns Zod
 * validation of events, credentials, reconnection, and auto-abort on
 * execution completion. This component only wires the subscription to the
 * React lifecycle and exposes event fields through context.
 */

import {
  type HtmlEvent,
  subscribeToHtmlEvents,
  useTimesSquarePage,
} from '@lsst-sqre/times-square-client';
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

type TimesSquareHtmlEventsProviderClientProps = {
  children: ReactNode;
};

export default function TimesSquareHtmlEventsProviderClient({
  children,
}: TimesSquareHtmlEventsProviderClientProps) {
  const [htmlEvent, setHtmlEvent] = useState<HtmlEvent | null>(null);

  const repertoireUrl = useRepertoireUrl();
  const urlParameters = useContext(TimesSquareUrlParametersContext);
  const githubSlug = urlParameters?.githubSlug ?? '';
  const { htmlEventsUrl } = useTimesSquarePage(githubSlug, { repertoireUrl });

  const urlQueryString = urlParameters?.urlQueryString ?? '';

  useEffect(() => {
    if (!htmlEventsUrl) {
      return undefined;
    }

    const params = Object.fromEntries(new URLSearchParams(urlQueryString));
    return subscribeToHtmlEvents(htmlEventsUrl, params, {
      onEvent: setHtmlEvent,
      onError: (error) => {
        console.error(
          `Error fetching Times Square events SSE ${htmlEventsUrl}`,
          error
        );
      },
    });
  }, [htmlEventsUrl, urlQueryString]);

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
