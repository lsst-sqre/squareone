import React from 'react';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';
import type { NavSection } from './SidebarLayout';
import SidebarNavItem from './SidebarNavItem';

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

const NavigationSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionLabel = styled.h3`
  margin: 1rem 0 0.5rem 0;
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
  margin-bottom: 0.25rem;
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
          <NavigationSection key={sectionIndex}>
            {section.label && <SectionLabel>{section.label}</SectionLabel>}

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
        ))}
      </NavigationContainer>
    </SidebarRoot>
  );
}
