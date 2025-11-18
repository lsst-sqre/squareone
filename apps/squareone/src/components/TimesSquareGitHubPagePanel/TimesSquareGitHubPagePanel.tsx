import React from 'react';
/*
 * TimesSquareGitHubPagePanel with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import dynamic from 'next/dynamic';
import styled from 'styled-components';

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareGitHubPagePanelClient = dynamic(
  () => import('./TimesSquareGitHubPagePanelClient'),
  {
    ssr: false,
    loading: () => (
      <PagePanelContainer>
        <p>Loading...</p>
      </PagePanelContainer>
    ),
  }
);

export default function TimesSquareGitHubPagePanel() {
  return <TimesSquareGitHubPagePanelClient />;
}

const PagePanelContainer = styled.div`
  padding: 1em;
  margin-right: calc(-1 * var(--size-screen-padding-min));
  border-radius: 15px 0 0 15px;
  margin-top: 1em;
  border: 1px solid var(--rsd-color-primary-600);
  border-right: none;
  box-shadow: var(--sqo-elevation-base);
`;
