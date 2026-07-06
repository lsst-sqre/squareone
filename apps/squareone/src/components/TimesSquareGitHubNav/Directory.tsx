/*
 * A "directory" filesystem tree item, which holds contents.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import clsx from 'clsx';
import { Book, Building2, ChevronDown, Folder } from 'lucide-react';
import React, { useId } from 'react';
import styles from './Directory.module.css';

type DirectoryNodeType = 'owner' | 'repo' | 'directory';

type DirectoryProps = {
  title: string;
  nodeType: DirectoryNodeType;
  current: boolean;
  /** Whether the contained subtree is visible. */
  expanded: boolean;
  /** Called when the disclosure button is activated. */
  onToggle: () => void;
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

function Directory({
  title,
  nodeType,
  current,
  expanded,
  onToggle,
  children,
}: DirectoryProps) {
  const NodeIcon = nodeTypeIcons[nodeType];
  const contentsId = useId();
  return (
    <div>
      <div
        className={clsx(styles.header, current && styles.headerCurrent)}
        aria-current={current ? 'true' : undefined}
      >
        <button
          type="button"
          className={styles.disclosureButton}
          aria-expanded={expanded}
          aria-controls={contentsId}
          aria-label={`Toggle ${title}`}
          onClick={onToggle}
        >
          <ChevronDown
            className={clsx(
              styles.icon,
              styles.disclosureIcon,
              !expanded && styles.disclosureIconCollapsed
            )}
            aria-hidden
          />
        </button>
        <NodeIcon className={styles.icon} aria-hidden />
        {title}
      </div>
      <div className={styles.contents} id={contentsId} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

export default Directory;
