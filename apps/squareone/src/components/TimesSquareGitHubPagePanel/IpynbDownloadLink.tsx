import { Download } from 'lucide-react';
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
      <a
        href={url}
        title={filename}
        download={filename}
        className={styles.link}
      >
        <Download className={styles.icon} size={16} /> Download notebook
      </a>
    </p>
  );
}
