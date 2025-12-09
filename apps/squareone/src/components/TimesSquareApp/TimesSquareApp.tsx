/*
 * TimesSquareApp provides the navigational controls for all Times Square
 * pages. The child of TimesSquareApp tends to be the content of the specific
 * page, usually the page viewer, or a markdown view of the GitHub repository.
 */

import React, { type ReactNode } from 'react';
import TimesSquareGitHubPagePanel from '../TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';
import TimesSquareMainGitHubNav from '../TimesSquareMainGitHubNav';
import TimesSquarePrGitHubNav from '../TimesSquarePrGitHubNav';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import Sidebar from './Sidebar';
import styles from './TimesSquareApp.module.css';

type TimesSquareAppProps = {
  children: ReactNode;
  pageNav?: ReactNode;
};

export default function TimesSquareApp({
  children,
  pageNav: providedPageNav,
}: TimesSquareAppProps) {
  const { tsSlug, owner, repo, commit, githubSlug } = React.useContext(
    TimesSquareUrlParametersContext
  );

  const defaultPageNav = commit ? (
    <TimesSquarePrGitHubNav owner={owner} repo={repo} commitSha={commit} />
  ) : (
    <TimesSquareMainGitHubNav pagePath={githubSlug} />
  );

  const pageNav = providedPageNav || defaultPageNav;

  return (
    <div className={styles.layout}>
      <Sidebar
        pageNav={pageNav}
        pagePanel={tsSlug ? <TimesSquareGitHubPagePanel /> : null}
      />
      <main>{children}</main>
    </div>
  );
}
