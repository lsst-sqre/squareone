import React, { useEffect, useRef } from 'react';
import useDisclosure from 'react-a11y-disclosure';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';
import MobileMenuToggle from './MobileMenuToggle';
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
  onNavigate?: (e: React.MouseEvent) => void;
};

const SkipLink = styled.a`
  /* Skip link for screen readers and keyboard navigation */
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--rsd-color-primary-700, #0c4a47);
  color: white;
  padding: 8px;
  z-index: 1000;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;

  &:focus {
    top: 6px;
    outline: 2px solid var(--rsd-color-primary-100, #e6f3ff);
    outline-offset: 2px;
  }
`;

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
    transition: max-height 0.3s ease, visibility 0.3s ease;
    max-height: ${({ $isOpen }) => ($isOpen ? '100vh' : '0')};

    /* When content is hidden via aria, ensure it's also visually hidden and not focusable */
    &[aria-hidden='true'] {
      visibility: hidden;

      /* Remove all focusable descendants from tab order */
      a,
      button,
      input,
      select,
      textarea,
      [tabindex]:not([tabindex='-1']) {
        /* Elements are hidden from focus via aria-hidden and visibility: hidden */
      }
    }

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

    /* Desktop sidebar should never have aria-hidden */
    &[aria-hidden='true'] {
      visibility: visible;

      a,
      button,
      input,
      select,
      textarea,
      [tabindex] {
        /* Elements are accessible via normal tabindex behavior on desktop */
      }
    }
  }
`;

const MobileHeader = styled.header`
  /* Mobile: sticky header with title and toggle */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
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

const MobileHeaderTitle = styled.h2`
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
  padding-bottom: 2rem;

  @media (min-width: ${ContentMaxWidth}) {
    padding-bottom: 3rem;
  }
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
  onNavigate,
}: SidebarLayoutProps) {
  // Refs for focus management
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Mobile menu disclosure state - starts closed by default
  const { toggleProps, contentProps, isExpanded } = useDisclosure({
    id: 'mobile-sidebar-menu',
    isExpanded: false,
  });

  // Determine the title href - default to first navigation item if not provided
  const resolvedTitleHref = titleHref || navSections[0]?.items[0]?.href || '#';

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Escape key closes mobile menu when expanded
    if (event.key === 'Escape' && isExpanded) {
      toggleProps.onClick();
      // Return focus to menu toggle button after closing
      setTimeout(() => {
        menuToggleRef.current?.focus();
      }, 100);
    }
  };

  // Navigation handler - closes mobile menu when navigation occurs
  const handleNavigateWithEvent = (e: React.MouseEvent) => {
    // Call the custom onNavigate handler if provided
    if (onNavigate) {
      onNavigate(e);
    }

    // We need to manually trigger the toggle if the menu is open
    if (isExpanded) {
      toggleProps.onClick();
    }
  };

  // Navigation handler for child components (without event parameter)
  const handleNavigate = () => {
    // We need to manually trigger the toggle if the menu is open
    if (isExpanded) {
      toggleProps.onClick();
    }
  };

  // Mobile menu toggle handler with focus management
  const handleMobileMenuToggle = () => {
    toggleProps.onClick();
  };

  // Skip to main content handler
  const handleSkipToMain = (event: React.MouseEvent) => {
    event.preventDefault();
    mainContentRef.current?.focus();
  };

  // Set up keyboard event listener for the entire layout
  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      // Escape key closes mobile menu when expanded
      if (event.key === 'Escape' && isExpanded) {
        toggleProps.onClick();
        // Return focus to menu toggle button after closing
        setTimeout(() => {
          menuToggleRef.current?.focus();
        }, 100);
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isExpanded, toggleProps]);

  return (
    <LayoutContainer data-testid="sidebar-layout" onKeyDown={handleKeyDown}>
      <SkipLink href="#main-content" onClick={handleSkipToMain}>
        Skip to main content
      </SkipLink>

      <MobileHeader data-testid="mobile-header">
        <MobileHeaderTitle>
          <MobileHeaderTitleLink
            href={resolvedTitleHref}
            onClick={handleNavigateWithEvent}
          >
            {sidebarTitle}
          </MobileHeaderTitleLink>
        </MobileHeaderTitle>
        <MobileMenuToggle
          ref={menuToggleRef}
          id={toggleProps.id}
          isOpen={isExpanded}
          onClick={handleMobileMenuToggle}
        />
      </MobileHeader>

      <SidebarContainer data-testid="sidebar-container" $isOpen={isExpanded}>
        <Sidebar
          title={sidebarTitle}
          titleHref={resolvedTitleHref}
          navSections={navSections}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          disclosureId={contentProps.id}
          disclosureAriaLabelledby={contentProps['aria-labelledby']}
        />
      </SidebarContainer>

      <MainContentContainer
        ref={mainContentRef}
        id="main-content"
        data-testid="main-content"
        tabIndex={-1}
      >
        {children}
      </MainContentContainer>
    </LayoutContainer>
  );
}
