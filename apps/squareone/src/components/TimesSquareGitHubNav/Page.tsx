/* A "Page" filesystem tree item, which links to a single page.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import clsx from 'clsx';
import { FileText } from 'lucide-react';
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
      <FileText className={styles.icon} aria-hidden />
      <Link href={path} aria-current={current ? 'page' : undefined}>
        {title}
      </Link>
    </div>
  );
}

export default Page;
