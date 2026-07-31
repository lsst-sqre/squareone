/*
 * TimesSquareHtmlEventsProvider with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import type { ExecutionError } from '@lsst-sqre/times-square-client';
import dynamic from 'next/dynamic';
import React from 'react';

type TimesSquareHtmlEventsProviderProps = {
  children: React.ReactNode;
};

// Create a default context for SSR fallback
export type TimesSquareHtmlEventsContextValue = {
  dateSubmitted: string | null;
  dateStarted: string | null;
  dateFinished: string | null;
  executionStatus: string | null;
  executionDuration: number | null;
  htmlHash: string | null;
  htmlUrl: string | null;
  /**
   * True once the SSE connection has permanently failed after exhausting the
   * bounded reconnect budget. Consumers can surface a terminal-failure state.
   */
  connectionFailed: boolean;
  /**
   * The terminal notebook-execution failure reported by Times Square, or null
   * while execution is pending or has succeeded (DM-55470). Deployments
   * predating DM-55470 omit the field entirely, which also normalizes to null.
   */
  executionError: ExecutionError | null;
};

export const TimesSquareHtmlEventsContext = React.createContext<
  TimesSquareHtmlEventsContextValue | undefined
>(undefined);

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareHtmlEventsProviderClient = dynamic(
  () => import('./TimesSquareHtmlEventsProviderClient'),
  {
    ssr: false,
    loading: () => {
      // Provide default context values during loading
      const defaultContextValue: TimesSquareHtmlEventsContextValue = {
        dateSubmitted: null,
        dateStarted: null,
        dateFinished: null,
        executionStatus: null,
        executionDuration: null,
        htmlHash: null,
        htmlUrl: null,
        connectionFailed: false,
        executionError: null,
      };
      // Return a provider that will be used by parent component with children
      return (
        <TimesSquareHtmlEventsContext.Provider value={defaultContextValue}>
          <div>Loading...</div>
        </TimesSquareHtmlEventsContext.Provider>
      );
    },
  }
);

export default function TimesSquareHtmlEventsProvider({
  children,
}: TimesSquareHtmlEventsProviderProps) {
  return (
    <TimesSquareHtmlEventsProviderClient>
      {children}
    </TimesSquareHtmlEventsProviderClient>
  );
}
