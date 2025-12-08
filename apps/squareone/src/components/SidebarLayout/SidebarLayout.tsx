import React, { useEffect, useRef } from 'react';
import useDisclosure from 'react-a11y-disclosure';

import MobileMenuToggle from './MobileMenuToggle';
import Sidebar from './Sidebar';
import styles from './SidebarLayout.module.css';

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
  prefetchPages: _prefetchPages = false,
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
    // biome-ignore lint/a11y/noStaticElementInteractions: keyboard handler for Escape key to close mobile menu
    <div
      className={styles.layoutContainer}
      data-testid="sidebar-layout"
      onKeyDown={handleKeyDown}
    >
      {/* biome-ignore lint/a11y/useValidAnchor: skip link is a standard a11y pattern that navigates to #main-content */}
      <a
        className={styles.skipLink}
        href="#main-content"
        onClick={handleSkipToMain}
      >
        Skip to main content
      </a>

      <header className={styles.mobileHeader} data-testid="mobile-header">
        <h2 className={styles.mobileHeaderTitle}>
          <a
            className={styles.mobileHeaderTitleLink}
            href={resolvedTitleHref}
            onClick={handleNavigateWithEvent}
          >
            {sidebarTitle}
          </a>
        </h2>
        <MobileMenuToggle
          ref={menuToggleRef}
          id={toggleProps.id}
          isOpen={isExpanded}
          onClick={handleMobileMenuToggle}
        />
      </header>

      <div
        className={
          isExpanded
            ? styles.sidebarContainerOpen
            : styles.sidebarContainerClosed
        }
        data-testid="sidebar-container"
      >
        <Sidebar
          title={sidebarTitle}
          titleHref={resolvedTitleHref}
          navSections={navSections}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          disclosureId={contentProps.id}
          disclosureAriaLabelledby={contentProps['aria-labelledby']}
        />
      </div>

      <main
        className={styles.mainContentContainer}
        ref={mainContentRef}
        id="main-content"
        data-testid="main-content"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
