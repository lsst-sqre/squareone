/*
 * A "directory" filesystem tree item, which holds contents.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import clsx from 'clsx';
import { Book, Building2, ChevronDown, Folder } from 'lucide-react';
import React from 'react';
import styles from './Directory.module.css';

type DirectoryNodeType = 'owner' | 'repo' | 'directory';

type DirectoryProps = {
  title: string;
  nodeType: DirectoryNodeType;
  current: boolean;
  children: React.ReactNode;
};

/** Lucide icon for each containing node type in the GitHub contents tree. */
const nodeTypeIcons: Record<
  DirectoryNodeType,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  owner: Building2,
  repo: Book,
  directory: Folder,
};

function Directory({ title, nodeType, current, children }: DirectoryProps) {
  const NodeIcon = nodeTypeIcons[nodeType];
  return (
    <div>
      <div className={clsx(styles.header, current && styles.headerCurrent)}>
        <ChevronDown className={styles.icon} aria-hidden />
        <NodeIcon className={styles.icon} aria-hidden />
        {title}
      </div>
      <div className={styles.contents}>{children}</div>
    </div>
  );
}

export default Directory;
