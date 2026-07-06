/*
 * A "directory" filesystem tree item, which holds contents.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import { DropdownMenu } from '@lsst-sqre/squared';
import clsx from 'clsx';
import {
  Book,
  Building2,
  ChevronDown,
  Folder,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
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
  /**
   * Href that focuses the sidebar on this node (sets `ts_nav_focus`). When
   * provided, the row shows a kebab menu with a focus action; null hides the
   * focus UI (e.g. in the PR-preview tree).
   */
  focusHref?: string | null;
  children: React.ReactNode;
};

/** Human-readable label for each containing node type, used in menu copy. */
const nodeTypeLabels: Record<DirectoryNodeType, string> = {
  owner: 'organization',
  repo: 'repository',
  directory: 'directory',
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
  focusHref = null,
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
        {focusHref && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild showChevron={false}>
              <button
                type="button"
                className={styles.kebabButton}
                aria-label={`Actions for ${title}`}
              >
                <MoreHorizontal className={styles.icon} aria-hidden />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.Item asChild>
                <Link href={focusHref}>
                  Focus on this {nodeTypeLabels[nodeType]}
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>
      <div className={styles.contents} id={contentsId} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

export default Directory;
