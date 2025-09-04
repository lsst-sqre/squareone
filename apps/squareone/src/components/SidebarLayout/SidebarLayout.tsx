import React from 'react';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';
import Sidebar from './Sidebar';

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
  /* Mobile layout: vertical stacking with flexbox */
  display: flex;
  flex-direction: column;
  padding: 0 var(--size-screen-padding-min);

  /* Desktop layout: CSS Grid with sidebar and content columns */
  @media (min-width: ${ContentMaxWidth}) {
    display: grid;
    grid-template-columns: 18rem 1fr;
    gap: 2rem;
    max-width: ${ContentMaxWidth};
    margin: 0 auto;
    padding: 0;
  }
`;

const SidebarContainer = styled.div`
  /* Mobile: navigation hidden by default, will be shown via disclosure pattern */
  @media (max-width: calc(${ContentMaxWidth} - 0.001rem)) {
    /* Navigation will be hidden by default, shown via disclosure */
  }

  /* Desktop: sidebar styling */
  @media (min-width: ${ContentMaxWidth}) {
    /* Desktop sidebar styling will be added in sticky positioning commit */
  }
`;

const MainContentContainer = styled.main`
  /* Full-width content areas with appropriate structure for mobile/desktop */
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
  currentPath = '',
  prefetchPages = false,
  titleHref,
}: SidebarLayoutProps) {
  // Determine the title href - default to first navigation item if not provided
  const resolvedTitleHref = titleHref || navSections[0]?.items[0]?.href || '#';

  // Placeholder onNavigate function - will be enhanced in mobile menu commits
  const handleNavigate = () => {
    // This will be used to close mobile menu when navigation occurs
  };

  return (
    <LayoutContainer data-testid="sidebar-layout">
      <SidebarContainer data-testid="sidebar-container">
        <Sidebar
          title={sidebarTitle}
          titleHref={resolvedTitleHref}
          navSections={navSections}
          currentPath={currentPath}
          onNavigate={handleNavigate}
        />
      </SidebarContainer>
      <MainContentContainer data-testid="main-content">
        {children}
      </MainContentContainer>
    </LayoutContainer>
  );
}
