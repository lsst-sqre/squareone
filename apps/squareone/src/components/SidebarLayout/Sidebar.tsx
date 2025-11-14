import type React from 'react';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';
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

const SidebarRoot = styled.aside`
  /* Mobile: add padding for better spacing inside disclosure container */
  @media (max-width: calc(${ContentMaxWidth} - 0.001rem)) {
    padding: 1rem var(--size-screen-padding-min);
    padding-left: calc(var(--size-screen-padding-min) + 0.75rem);
  }

  /* Desktop: sticky positioning with full viewport height and overflow */
  @media (min-width: ${ContentMaxWidth}) {
    position: sticky;
    top: 0;
    max-height: 100vh;
    overflow-y: auto;
    padding-right: 1rem; /* Space for scrollbar */
    padding-left: 0.75rem; /* Space for navigation items with negative margins */
  }
`;

const SidebarTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;

  /* Hide on mobile to prevent duplication with MobileHeaderTitle */
  @media (max-width: calc(${ContentMaxWidth} - 0.001rem)) {
    display: none;
  }

  /* Desktop: add top margin */
  @media (min-width: ${ContentMaxWidth}) {
    margin-top: 1rem;
  }
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
  disclosureId,
  disclosureAriaLabelledby,
}: SidebarProps) {
  return (
    <SidebarRoot
      aria-label={title}
      id={disclosureId}
      aria-labelledby={disclosureAriaLabelledby}
    >
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
