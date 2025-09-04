import React from 'react';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';
import type { NavSection } from './SidebarLayout';
import SidebarNavSection from './SidebarNavSection';

export type SidebarProps = {
  title: string;
  titleHref: string;
  navSections: NavSection[];
  currentPath: string;
  onNavigate: () => void;
};

const SidebarRoot = styled.aside`
  /* Mobile: add padding for better spacing inside disclosure container */
  @media (max-width: calc(${ContentMaxWidth} - 0.001rem)) {
    padding: 1rem var(--size-screen-padding-min);
  }

  /* Desktop: sticky positioning with full viewport height and overflow */
  @media (min-width: ${ContentMaxWidth}) {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    padding-right: 1rem; /* Space for scrollbar */
  }
`;

const SidebarTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;
`;

const SidebarTitleLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid var(--rsd-color-primary-600, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const NavigationContainer = styled.nav`
  /* Navigation container for semantic structure */
`;

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
}: SidebarProps) {
  return (
    <SidebarRoot>
      <SidebarTitle>
        <SidebarTitleLink href={titleHref} onClick={onNavigate}>
          {title}
        </SidebarTitleLink>
      </SidebarTitle>

      <NavigationContainer>
        {navSections.map((section, sectionIndex) => (
          <SidebarNavSection
            key={sectionIndex}
            section={section}
            sectionIndex={sectionIndex}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </NavigationContainer>
    </SidebarRoot>
  );
}
