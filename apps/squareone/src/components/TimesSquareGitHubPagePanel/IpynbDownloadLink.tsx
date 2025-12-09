import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './IpynbDownloadLink.module.css';

type IpynbDownloadLinkProps = {
  url: string;
  sourcePath: string | null;
};

export default function IpynbDownloadLink({
  url,
  sourcePath,
}: IpynbDownloadLinkProps) {
  // get the filename from the sourcePath
  const filename = sourcePath ? sourcePath.split('/').pop() : undefined;

  return (
    <p className={styles.paragraph}>
      <a href={url} title={filename} download={filename}>
        <FontAwesomeIcon icon="download" className={styles.icon} /> Download
        notebook
      </a>
    </p>
  );
}
