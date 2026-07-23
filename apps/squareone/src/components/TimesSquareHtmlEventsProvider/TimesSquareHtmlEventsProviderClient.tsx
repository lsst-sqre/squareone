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

import { makeReportError } from '@/lib/sentry/reportError';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import {
  TimesSquareHtmlEventsContext,
  type TimesSquareHtmlEventsContextValue,
} from './TimesSquareHtmlEventsProvider';

/**
 * Maximum number of SSE reconnect attempts before the connection is treated as
 * a terminal failure. `fetchEventSource` retries indefinitely by default; this
 * bounds that so a persistently unreachable endpoint stops silently retrying
 * and instead surfaces a user-facing error and a single Sentry capture.
 */
export const MAX_SSE_RECONNECT_ATTEMPTS = 5;

/** Base backoff (ms) between SSE reconnect attempts. */
const SSE_RECONNECT_BACKOFF_MS = 1000;

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
  const [connectionFailed, setConnectionFailed] = useState(false);

  // Inject the app's Sentry-backed reporter for connection failures.
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const repertoireUrl = useRepertoireUrl();
  const urlParameters = useContext(TimesSquareUrlParametersContext);
  const githubSlug = urlParameters?.githubSlug ?? '';
  const { htmlEventsUrl } = useTimesSquarePage(githubSlug, {
    repertoireUrl,
    owner: urlParameters?.owner,
    repo: urlParameters?.repo,
    commit: urlParameters?.commit,
  });

  const urlQueryString = urlParameters?.urlQueryString;
  const fullHtmlEventsUrl = htmlEventsUrl
    ? `${htmlEventsUrl}?${urlQueryString}`
    : null;

  useEffect(() => {
    // Don't run SSE on server side
    if (!isClient) return () => {};

    const abortController = new AbortController();
    // Per-subscription reconnect bookkeeping. `reconnectAttempts` bounds
    // fetchEventSource's otherwise-infinite retry loop; `reported` throttles
    // capture so a persistent outage produces a single Sentry event rather than
    // one per reconnect attempt.
    let reconnectAttempts = 0;
    let reported = false;

    // Reset any prior terminal-failure state when (re)subscribing.
    setConnectionFailed(false);

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

            // Capture the connection error at most once per subscription so a
            // sustained outage does not flood Sentry across reconnect attempts.
            if (!reported) {
              reported = true;
              reportError(err, {
                site: 'times-square-sse',
                package: 'times-square-client',
              });
            }

            reconnectAttempts += 1;
            if (reconnectAttempts >= MAX_SSE_RECONNECT_ATTEMPTS) {
              // Throwing from onerror stops fetchEventSource from reconnecting:
              // the connection is now in a terminal-failure state.
              setConnectionFailed(true);
              throw err instanceof Error ? err : new Error(String(err));
            }
            // Returning a number retries after that backoff.
            return SSE_RECONNECT_BACKOFF_MS * reconnectAttempts;
          },
        });
      }
    }
    runEffect();

    return () => {
      // Clean up: close the event source connection
      abortController.abort();
    };
  }, [fullHtmlEventsUrl, htmlEventsUrl, isClient, reportError]);

  const contextValue = useMemo(
    (): TimesSquareHtmlEventsContextValue => ({
      dateSubmitted: htmlEvent ? htmlEvent.date_submitted : null,
      dateStarted: htmlEvent ? htmlEvent.date_started : null,
      dateFinished: htmlEvent ? htmlEvent.date_finished : null,
      executionStatus: htmlEvent ? htmlEvent.execution_status : null,
      executionDuration: htmlEvent ? htmlEvent.execution_duration : null,
      htmlHash: htmlEvent ? htmlEvent.html_hash : null,
      htmlUrl: htmlEvent ? htmlEvent.html_url : null,
      connectionFailed,
    }),
    [htmlEvent, connectionFailed]
  );

  return (
    <TimesSquareHtmlEventsContext.Provider value={contextValue}>
      {connectionFailed && (
        <p role="alert">
          Lost the connection to the notebook execution status updates. Reload
          the page to try again.
        </p>
      )}
      {children}
    </TimesSquareHtmlEventsContext.Provider>
  );
}
