/*
 * Client-only TimesSquareHtmlEventsProvider component - handles SSE events on client side only.
 */

import {
  createHtmlEventsUrl,
  type HtmlEvent,
  SseConnectionFailedError,
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

import { makeReportError } from '@/lib/sentry/reportError';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import {
  TimesSquareHtmlEventsContext,
  type TimesSquareHtmlEventsContextValue,
} from './TimesSquareHtmlEventsProvider';
import styles from './TimesSquareHtmlEventsProviderClient.module.css';

/**
 * Maximum number of consecutive SSE connection failures before the subscription
 * is treated as a terminal failure. The underlying transport retries
 * indefinitely by default; this bounds that so a persistently unreachable
 * endpoint stops silently retrying and instead surfaces a user-facing error and
 * a single Sentry capture.
 */
const MAX_SSE_RECONNECT_ATTEMPTS = 5;

/** Base backoff (ms) between SSE reconnect attempts; scales linearly. */
const SSE_RECONNECT_BACKOFF_MS = 1000;

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

  // The page's own query string carries both notebook parameters and the
  // reserved `ts_`-prefixed display settings; the events endpoint takes them
  // all, so forward the whole set.
  const urlQueryString = urlParameters?.urlQueryString;
  const fullHtmlEventsUrl = useMemo(() => {
    if (!htmlEventsUrl) return null;
    const params = Object.fromEntries(
      new URLSearchParams(urlQueryString ?? '')
    );
    return createHtmlEventsUrl(htmlEventsUrl, params);
  }, [htmlEventsUrl, urlQueryString]);

  useEffect(() => {
    // Don't run SSE on server side
    if (!isClient || !fullHtmlEventsUrl) return () => {};

    // Throttles capture so a persistent outage produces a single Sentry event
    // rather than one per reconnect attempt.
    let reported = false;

    // Reset any prior terminal-failure state when (re)subscribing.
    setConnectionFailed(false);

    return subscribeToHtmlEvents(fullHtmlEventsUrl, undefined, {
      onEvent: setHtmlEvent,
      onError(error) {
        console.error(
          `Error fetching Times Square events SSE ${fullHtmlEventsUrl}`,
          error
        );

        if (error instanceof SseConnectionFailedError) {
          // The terminal signal from the bounded-reconnect budget. Its `cause`
          // was already captured as the first error of this run, so surface the
          // user-facing state without a second, duplicate Sentry event.
          setConnectionFailed(true);
          return;
        }

        // Capture at most once per subscription so a sustained outage — or a
        // stream of schema-invalid events — does not flood Sentry.
        if (!reported) {
          reported = true;
          reportError(error, {
            site: 'times-square-sse',
            package: 'times-square-client',
          });
        }
      },
      maxReconnectAttempts: MAX_SSE_RECONNECT_ATTEMPTS,
      reconnectBackoffMs: SSE_RECONNECT_BACKOFF_MS,
    });
  }, [fullHtmlEventsUrl, isClient, reportError]);

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
      executionError: htmlEvent ? htmlEvent.execution_error : null,
    }),
    [htmlEvent, connectionFailed]
  );

  return (
    <TimesSquareHtmlEventsContext.Provider value={contextValue}>
      {connectionFailed && (
        <p role="alert" className={styles.connectionAlert}>
          Lost the connection to the notebook execution status updates. Reload
          the page to try again.
        </p>
      )}
      {children}
    </TimesSquareHtmlEventsContext.Provider>
  );
}
