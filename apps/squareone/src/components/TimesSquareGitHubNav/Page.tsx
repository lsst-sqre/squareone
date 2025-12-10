/* A "Page" filesystem tree item, which links to a single page.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Link from 'next/link';
import styles from './Page.module.css';

type PageProps = {
  title: string;
  path: string;
  current: boolean;
};

function Page({ title, path, current }: PageProps) {
  return (
    <div className={clsx(styles.wrapper, current && styles.wrapperCurrent)}>
      <FontAwesomeIcon icon="file" className={styles.icon} />
      <Link href={path}>{title}</Link>
    </div>
  );
}

export default Page;
