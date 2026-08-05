/*
 * Client-only TimesSquareHtmlEventsProvider component - handles SSE events on client side only.
 */

import {
  createHtmlEventsUrl,
  type HtmlEvent,
  SseConnectionFailedError,
  subscribeToHtmlEvents,
  timesSquareKeys,
  useTimesSquarePage,
} from '@lsst-sqre/times-square-client';
import { useQueryClient } from '@tanstack/react-query';
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

/** Whether a mutation is the package's page re-run (html soft delete). */
function isRerunPageMutation(mutationKey: unknown): boolean {
  const rerunKey = timesSquareKeys.rerunPage();
  return (
    Array.isArray(mutationKey) &&
    mutationKey.length === rerunKey.length &&
    rerunKey.every((segment, index) => mutationKey[index] === segment)
  );
}

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

  // Bumped to re-establish the subscription. The transport aborts the stream
  // once execution reaches a terminal state (a rendering or a failure), which
  // is right while nothing more can happen to the page instance — but a re-run
  // schedules a new execution, and without a fresh subscription no event would
  // ever report it: the panel would keep describing the run that was replaced.
  // The re-run mutation already invalidates the html-status queries; the events
  // stream is not in the query cache, so the mutation cache is watched directly
  // here. Every re-run path (the panel's Recompute, the viewer's failure-panel
  // Re-run) goes through that one mutation, so none of them has to know that
  // this provider exists.
  const [eventsEpoch, setEventsEpoch] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    return queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') {
        return;
      }
      if (!isRerunPageMutation(event.mutation.options.mutationKey)) {
        return;
      }
      setEventsEpoch((epoch) => epoch + 1);
    });
  }, [queryClient]);

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
  }, [fullHtmlEventsUrl, isClient, reportError, eventsEpoch]);

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
