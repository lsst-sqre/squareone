import React from 'react';
/*
 * TimesSquareMainGitHubNav with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import dynamic from 'next/dynamic';

type TimesSquareMainGitHubNavProps = {
  pagePath: string;
};

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareMainGitHubNavClient = dynamic(
  () => import('./TimesSquareMainGitHubNavClient'),
  {
    ssr: false,
    loading: () => null, // No loading state needed for navigation
  }
);

function TimesSquareMainGitHubNav({ pagePath }: TimesSquareMainGitHubNavProps) {
  return <TimesSquareMainGitHubNavClient pagePath={pagePath} />;
}

export default TimesSquareMainGitHubNav;
