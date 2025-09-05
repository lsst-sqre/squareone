import React from 'react';
import styled from 'styled-components';

import type { NavSection } from './SidebarLayout';
import SidebarNavItem from './SidebarNavItem';

export type SidebarNavSectionProps = {
  section: NavSection;
  sectionIndex: number;
  currentPath: string;
  onNavigate: () => void;
};

const NavigationSection = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionLabel = styled.h3`
  margin: 1rem 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: bold;
  color: var(--rsd-color-gray-600, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:first-child {
    margin-top: 0;
  }
`;

const NavigationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavigationItem = styled.li`
  margin-bottom: 0;
`;

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
    <NavigationSection data-testid={`nav-section-${sectionIndex}`}>
      {section.label && (
        <SectionLabel data-testid="section-label">{section.label}</SectionLabel>
      )}

      <NavigationList>
        {section.items.map((item, itemIndex) => (
          <NavigationItem key={`${sectionIndex}-${itemIndex}`}>
            <SidebarNavItem
              item={item}
              isActive={currentPath === item.href}
              onNavigate={onNavigate}
            />
          </NavigationItem>
        ))}
      </NavigationList>
    </NavigationSection>
  );
}
