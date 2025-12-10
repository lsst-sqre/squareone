import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './GitHubEditLink.module.css';

type GitHubEditLinkProps = {
  owner: string | null;
  repository: string | null;
  sourcePath: string | null;
};

export default function GitHubEditLink({
  owner,
  repository,
  sourcePath,
}: GitHubEditLinkProps) {
  if (!owner || !repository || !sourcePath) {
    return null;
  }

  const editUrl = `https://github.com/${owner}/${repository}/blob/main/${sourcePath}`;

  return (
    <p>
      <a href={editUrl}>
        <FontAwesomeIcon icon={['fab', 'github']} className={styles.icon} />
        {owner}/{repository}
      </a>
    </p>
  );
}
