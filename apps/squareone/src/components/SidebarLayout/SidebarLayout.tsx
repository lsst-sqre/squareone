import React from 'react';
import styled from 'styled-components';
import useDisclosure from 'react-a11y-disclosure';

import { ContentMaxWidth } from '../../styles/sizes';
import Sidebar from './Sidebar';
import MobileMenuToggle from './MobileMenuToggle';

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

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  /* Mobile: navigation with disclosure animation */
  @media (max-width: calc(${ContentMaxWidth} - 0.001rem)) {
    overflow: hidden;
    transition: max-height 0.3s ease;
    max-height: ${({ $isOpen }) => ($isOpen ? '100vh' : '0')};

    /* When content is hidden via aria, ensure it's also visually hidden */
    &[hidden] {
      max-height: 0;
    }
  }

  /* Desktop: sidebar styling - always visible */
  @media (min-width: ${ContentMaxWidth}) {
    max-height: none;
    overflow: visible;

    /* Ensure desktop sidebar is never hidden */
    &[hidden] {
      display: block;
      max-height: none;
    }
  }
`;

const MobileHeader = styled.header`
  /* Mobile: sticky header with title and toggle */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--size-screen-padding-min);
  background: white;
  border-bottom: 1px solid var(--rsd-color-gray-200, #e5e7eb);
  position: sticky;
  top: 0;
  z-index: 10;

  /* Desktop: completely hidden */
  @media (min-width: ${ContentMaxWidth}) {
    display: none;
  }
`;

const MobileHeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.125rem;
  font-weight: bold;
  color: inherit;
`;

const MobileHeaderTitleLink = styled.a`
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
  // Mobile menu disclosure state - starts closed by default
  const { toggleProps, contentProps, isExpanded } = useDisclosure({
    id: 'mobile-sidebar-menu',
    isExpanded: false,
  });

  // Determine the title href - default to first navigation item if not provided
  const resolvedTitleHref = titleHref || navSections[0]?.items[0]?.href || '#';

  // Navigation handler - closes mobile menu when navigation occurs
  const handleNavigate = () => {
    // We need to manually trigger the toggle if the menu is open
    if (isExpanded) {
      toggleProps.onClick();
    }
  };

  // Mobile menu toggle handler - just use the toggle function from disclosure
  const handleMobileMenuToggle = () => {
    toggleProps.onClick();
  };

  return (
    <LayoutContainer data-testid="sidebar-layout">
      <MobileHeader data-testid="mobile-header">
        <MobileHeaderTitle>
          <MobileHeaderTitleLink href={resolvedTitleHref}>
            {sidebarTitle}
          </MobileHeaderTitleLink>
        </MobileHeaderTitle>
        <MobileMenuToggle
          isOpen={isExpanded}
          onClick={handleMobileMenuToggle}
          {...toggleProps}
        />
      </MobileHeader>

      <SidebarContainer
        data-testid="sidebar-container"
        $isOpen={isExpanded}
        {...contentProps}
      >
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
