import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './GitHubPrTitle.module.css';

type GitHubPrTitleProps = {
  /**
   * Owner of the GitHub repository.
   */
  owner?: string;
  /**
   * Name of the GitHub repository.
   */
  repo?: string;
  /**
   * The commit SHA corresponding to the GitHub check run.
   */
  commit?: string;
};

/**
 * Header component for the `TimesSquarePrGitHubNav` panel.
 */
export default function GitHubPrTitle({
  owner,
  repo,
  commit,
}: GitHubPrTitleProps) {
  return (
    <header className={styles.header}>
      <p className={styles.subtitle}>PR Preview</p>

      <h2>
        <a
          className={styles.hiddenLink}
          href={`https://github.com/${owner}/${repo}/`}
        >{`${owner}/${repo}`}</a>
      </h2>
      <p>
        <FontAwesomeIcon icon="code-commit" className={styles.icon} />{' '}
        {commit?.slice(0, 7)}
      </p>
    </header>
  );
}
