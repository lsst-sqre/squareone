/*
 * TimesSquareHtmlEventsProvider with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import React from 'react';
import dynamic from 'next/dynamic';

type TimesSquareHtmlEventsProviderProps = {
  children: React.ReactNode;
};

// Create a default context for SSR fallback
type TimesSquareHtmlEventsContextValue = {
  dateSubmitted: string | null;
  dateStarted: string | null;
  dateFinished: string | null;
  executionStatus: string | null;
  executionDuration: number | null;
  htmlHash: string | null;
  htmlUrl: string | null;
};

export const TimesSquareHtmlEventsContext = React.createContext<
  TimesSquareHtmlEventsContextValue | undefined
>(undefined);

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareHtmlEventsProviderClient = dynamic(
  () => import('./TimesSquareHtmlEventsProviderClient'),
  {
    ssr: false,
    loading: ({ children }: { children: React.ReactNode }) => {
      // Provide default context values during loading
      const defaultContextValue: TimesSquareHtmlEventsContextValue = {
        dateSubmitted: null,
        dateStarted: null,
        dateFinished: null,
        executionStatus: null,
        executionDuration: null,
        htmlHash: null,
        htmlUrl: null,
      };
      return (
        <TimesSquareHtmlEventsContext.Provider value={defaultContextValue}>
          {children}
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
