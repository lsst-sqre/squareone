import React from 'react';

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
  // For now, render a basic container structure
  // Desktop layout and responsive behavior will be added in subsequent commits
  return (
    <div data-testid="sidebar-layout">
      <div data-testid="sidebar-container">
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
      </div>
      <main data-testid="main-content">{children}</main>
    </div>
  );
}
