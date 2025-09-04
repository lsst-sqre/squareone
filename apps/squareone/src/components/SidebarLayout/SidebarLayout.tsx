import React from 'react';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';

export type NavItem = {
  href: string;
  label: string;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export type SidebarLayoutProps = {
  children: React.ReactNode;
  sidebarTitle: string;
  navSections: NavSection[];
  currentPath?: string;
  prefetchPages?: boolean;
  titleHref?: string;
};

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 18rem 1fr;
  gap: 2rem;
  max-width: ${ContentMaxWidth};
  margin: 0 auto;
`;

const SidebarContainer = styled.div`
  /* Placeholder for sidebar styling */
`;

const MainContentContainer = styled.main`
  /* Main content area */
`;

/*
 * Generic sidebar layout component for any sidebar + content layout.
 * Manages responsive breakpoint behavior and provides a reusable
 * structure for sidebar-based navigation.
 */
export default function SidebarLayout({
  children,
  sidebarTitle,
  navSections,
  currentPath,
  prefetchPages = false,
  titleHref,
}: SidebarLayoutProps) {
  return (
    <LayoutContainer data-testid="sidebar-layout">
      <SidebarContainer data-testid="sidebar-container">
        <h2 data-testid="sidebar-title">{sidebarTitle}</h2>
        {/* Navigation sections will be rendered here */}
        {navSections.map((section, index) => (
          <div key={index} data-testid={`nav-section-${index}`}>
            {section.label && (
              <div data-testid={`section-label-${index}`}>{section.label}</div>
            )}
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                data-testid={`nav-item-${index}-${itemIndex}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </SidebarContainer>
      <MainContentContainer data-testid="main-content">
        {children}
      </MainContentContainer>
    </LayoutContainer>
  );
}
