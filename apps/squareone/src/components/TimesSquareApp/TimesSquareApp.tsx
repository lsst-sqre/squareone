/*
 * TimesSquareApp provides the navigational controls for all Times Square
 * pages. The child of TimesSquareApp tends to be the content of the specific
 * page, usually the page viewer, or a markdown view of the GitHub repository.
 */

import React, { type ReactNode } from 'react';
import styled from 'styled-components';
import TimesSquareGitHubPagePanel from '../TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';
import TimesSquareMainGitHubNav from '../TimesSquareMainGitHubNav';
import TimesSquarePrGitHubNav from '../TimesSquarePrGitHubNav';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import Sidebar from './Sidebar';

type TimesSquareAppProps = {
  children: ReactNode;
  pageNav?: ReactNode;
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

export default function TimesSquareApp({
  children,
  pageNav: providedPageNav,
}: TimesSquareAppProps) {
  const { tsSlug, owner, repo, commit, githubSlug, urlQueryString } =
    React.useContext(TimesSquareUrlParametersContext);

  const defaultPageNav = commit ? (
    <TimesSquarePrGitHubNav owner={owner} repo={repo} commitSha={commit} />
  ) : (
    <TimesSquareMainGitHubNav pagePath={githubSlug} />
  );

  const pageNav = providedPageNav || defaultPageNav;

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
