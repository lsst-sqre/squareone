import React from 'react';
/*
 * TimesSquarePrGitHubNav with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import dynamic from 'next/dynamic';

type TimesSquarePrGitHubNavProps = {
  owner: string;
  repo: string;
  commitSha: string;
  showPrDetails?: boolean;
};

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquarePrGitHubNavClient = dynamic(
  () => import('./TimesSquarePrGitHubNavClient'),
  {
    ssr: false,
    loading: () => null, // No loading state needed for navigation
  }
);

function TimesSquarePrGitHubNav({
  owner,
  repo,
  commitSha,
  showPrDetails = true,
}: TimesSquarePrGitHubNavProps) {
  return (
    <TimesSquarePrGitHubNavClient
      owner={owner}
      repo={repo}
      commitSha={commitSha}
      showPrDetails={showPrDetails}
    />
  );
}

export default TimesSquarePrGitHubNav;
