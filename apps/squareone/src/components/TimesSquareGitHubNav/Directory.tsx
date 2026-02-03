/*
 * A "directory" filesystem tree item, which holds contents.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import styles from './Directory.module.css';

type DirectoryProps = {
  title: string;
  current: boolean;
  children: React.ReactNode;
};

function Directory({ title, current, children }: DirectoryProps) {
  return (
    <div>
      <div className={clsx(styles.header, current && styles.headerCurrent)}>
        <ChevronDown className={styles.icon} />
        {title}
      </div>
      <div className={styles.contents}>{children}</div>
    </div>
  );
}

export default Directory;
