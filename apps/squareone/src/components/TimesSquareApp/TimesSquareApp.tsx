/*
 * TimesSquareApp provides the navigational controls for all Times Square
 * pages. The child of TimesSquareApp tends to be the content of the specific
 * page, usually the page viewer, or a markdown view of the GitHub repository.
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';

import Sidebar from './Sidebar';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import TimesSquareMainGitHubNav from '../TimesSquareMainGitHubNav';
import TimesSquarePrGitHubNav from '../TimesSquarePrGitHubNav';
import TimesSquareGitHubPagePanel from '../TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';

type TimesSquareAppProps = {
  children: ReactNode;
};

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  height: 100%;

  // main content
  main {
    width: 100%;
  }
`;

export default function TimesSquareApp({ children }: TimesSquareAppProps) {
  const { tsSlug, owner, repo, commit, githubSlug, urlQueryString } =
    React.useContext(TimesSquareUrlParametersContext);

  const pageNav = commit ? (
    <TimesSquarePrGitHubNav owner={owner} repo={repo} commitSha={commit} />
  ) : (
    <TimesSquareMainGitHubNav pagePath={githubSlug} />
  );

  return (
    <StyledLayout>
      <Sidebar
        pageNav={pageNav}
        pagePanel={tsSlug ? <TimesSquareGitHubPagePanel /> : null}
      />
      <main>{children}</main>
    </StyledLayout>
  );
}
