import GitHubIcon from '../icons/GitHubIcon';
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
      <a href={editUrl} className={styles.link}>
        <GitHubIcon className={styles.icon} size={16} />
        {owner}/{repository}
      </a>
    </p>
  );
}
