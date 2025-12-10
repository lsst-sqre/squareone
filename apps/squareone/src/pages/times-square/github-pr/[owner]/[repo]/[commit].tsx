import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';

import TimesSquareApp from '../../../../../components/TimesSquareApp';
import TimesSquarePrGitHubNav from '../../../../../components/TimesSquarePrGitHubNav';
import GitHubCheckBadge from '../../../../../components/TimesSquarePrGitHubNav/GitHubCheckBadge';
import GitHubPrBadge from '../../../../../components/TimesSquarePrGitHubNav/GitHubPrBadge';
import useGitHubPrContentsListing from '../../../../../components/TimesSquarePrGitHubNav/useGitHubPrContentsListing';
import WideContentLayout from '../../../../../components/WideContentLayout';
import { useAppConfig } from '../../../../../contexts/AppConfigContext';
import { loadFooterMdx } from '../../../../../lib/config/footerLoader';
import { loadAppConfig } from '../../../../../lib/config/loader';
import styles from './commit.module.css';

// biome-ignore lint/complexity/noBannedTypes: Empty props object required for Next.js page
type GitHubPrLandingPageProps = {};

export default function GitHubPrLandingPage() {
  const appConfig = useAppConfig();
  const { timesSquareUrl } = appConfig;
  const router = useRouter();
  const { owner, repo, commit } = router.query;

  const githubContents = useGitHubPrContentsListing(
    timesSquareUrl,
    Array.isArray(owner) ? owner[0] : owner,
    Array.isArray(repo) ? repo[0] : repo,
    Array.isArray(commit) ? commit[0] : commit
  );

  const pageNav = (
    <TimesSquarePrGitHubNav
      owner={Array.isArray(owner) ? owner[0] : owner}
      repo={Array.isArray(repo) ? repo[0] : repo}
      commitSha={Array.isArray(commit) ? commit[0] : commit}
      showPrDetails={false}
    />
  );

  let prDetails: React.ReactNode;
  if (!(githubContents.loading || githubContents.error)) {
    const { nbCheck, yamlCheck } = githubContents;
    prDetails = (
      <>
        <ul className={styles.itemList}>
          {githubContents.pullRequests.map((pr) => (
            <li key={`pr-${pr.number}`}>
              <GitHubPrBadge
                state={pr.state}
                number={pr.number}
                url={pr.conversation_url}
                title={pr.title}
                authorName={pr.contributor.username}
                authorAvatarUrl={pr.contributor.avatar_url}
                authorUrl={pr.contributor.html_url}
              />
            </li>
          ))}
        </ul>

        <ul className={styles.itemList}>
          {nbCheck && (
            <li>
              <GitHubCheckBadge
                status={nbCheck.status}
                title={nbCheck.report_title}
                conclusion={nbCheck.conclusion}
                url={nbCheck.html_url}
              />
            </li>
          )}
          {yamlCheck && (
            <li>
              <GitHubCheckBadge
                status={yamlCheck.status}
                title={yamlCheck.report_title}
                conclusion={yamlCheck.conclusion}
                url={yamlCheck.html_url}
              />
            </li>
          )}
        </ul>
      </>
    );
  } else {
    prDetails = null;
  }

  return (
    <TimesSquareApp pageNav={pageNav}>
      <Head>
        <title>
          Pull Request Preview{' '}
          {`${owner}/${repo} ${commit} | ${appConfig.siteName}`}
        </title>
      </Head>

      <header className={styles.header}>
        <p className="subtitle">Pull Request Preview</p>
        <h1>
          {`${Array.isArray(owner) ? owner[0] : owner}/${
            Array.isArray(repo) ? repo[0] : repo
          }`}{' '}
          <span className={styles.commitSpan}>
            <FontAwesomeIcon icon="code-commit" className={styles.commitIcon} />{' '}
            {(Array.isArray(commit) ? commit[0] : commit || '').slice(0, 7)}
          </span>
        </h1>
      </header>

      {prDetails}
    </TimesSquareApp>
  );
}

GitHubPrLandingPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export const getServerSideProps: GetServerSideProps<
  GitHubPrLandingPageProps
> = async () => {
  try {
    const appConfig = await loadAppConfig();
    const footerMdxSource = await loadFooterMdx(appConfig);

    // Make the page return a 404 if Times Square is not configured
    const notFound = !appConfig.timesSquareUrl;

    return {
      notFound,
      props: {
        appConfig,
        footerMdxSource,
      },
    };
  } catch (error) {
    console.error(
      'Failed to load configuration for Times Square GitHub PR landing page:',
      error
    );

    // Return 404 if configuration loading fails
    return {
      notFound: true,
    };
  }
};
