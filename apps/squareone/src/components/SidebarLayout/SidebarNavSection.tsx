import type { KeyboardEvent, MouseEvent } from 'react';
import React from 'react';

import type { NavSection } from './SidebarLayout';
import SidebarNavItem from './SidebarNavItem';
import styles from './SidebarNavSection.module.css';

export type SidebarNavSectionProps = {
  section: NavSection;
  sectionIndex: number;
  currentPath: string;
  onNavigate: (e?: MouseEvent | KeyboardEvent) => void;
};

/*
 * Navigation section component that handles rendering of a single navigation
 * section with optional label and list of navigation items. Conditionally
 * renders the section label based on whether it's provided.
 */
export default function SidebarNavSection({
  section,
  sectionIndex,
  currentPath,
  onNavigate,
}: SidebarNavSectionProps) {
  return (
    <div className={styles.section} data-testid={`nav-section-${sectionIndex}`}>
      {section.label && (
        <h3 className={styles.label} data-testid="section-label">
          {section.label}
        </h3>
      )}

      <ul className={styles.list}>
        {section.items.map((item, itemIndex) => (
          <li className={styles.item} key={`${sectionIndex}-${itemIndex}`}>
            <SidebarNavItem
              item={item}
              isActive={currentPath === item.href}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
