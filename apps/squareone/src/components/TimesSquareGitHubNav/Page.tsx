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
      <Link href={path}>
        {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */}
        {title}
      </Link>
    </div>
  );
}

export default Page;
