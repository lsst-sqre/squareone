import React from 'react';
import styles from './Sidebar.module.css';
import type { NavSection } from './SidebarLayout';
import SidebarNavSection from './SidebarNavSection';

export type SidebarProps = {
  title: string;
  titleHref: string;
  navSections: NavSection[];
  currentPath: string;
  onNavigate: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  disclosureId?: string;
  disclosureAriaLabelledby?: string;
};

/*
 * Sidebar component that renders the navigation structure.
 * Displays title as a clickable heading and renders navigation sections
 * with optional labels and proper semantic HTML structure.
 */
export default function Sidebar({
  title,
  titleHref,
  navSections,
  currentPath,
  onNavigate,
  disclosureId,
  disclosureAriaLabelledby,
}: SidebarProps) {
  return (
    <aside
      className={styles.root}
      aria-label={title}
      id={disclosureId}
      aria-labelledby={disclosureAriaLabelledby}
    >
      <h2 className={styles.title}>
        <a className={styles.titleLink} href={titleHref} onClick={onNavigate}>
          {title}
        </a>
      </h2>

      <nav>
        {navSections.map((section, sectionIndex) => (
          <SidebarNavSection
            key={sectionIndex}
            section={section}
            sectionIndex={sectionIndex}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  );
}
