import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import SidebarLayout from './SidebarLayout';
import type { NavSection } from './SidebarLayout';

const mockNavSections: NavSection[] = [
  {
    items: [
      { href: '/settings/profile', label: 'Profile' },
      { href: '/settings/account', label: 'Account' },
    ],
  },
  {
    label: 'Security',
    items: [
      { href: '/settings/sessions', label: 'Sessions' },
      { href: '/settings/tokens', label: 'Access Tokens' },
    ],
  },
];

test('renders with required props', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={mockNavSections}
      currentPath="/settings/profile"
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  expect(screen.getAllByText('Settings')).toHaveLength(2); // Both mobile header and sidebar
  expect(screen.getByText('Main Content')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});

test('displays navigation items', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={mockNavSections}
      currentPath="/settings/profile"
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  expect(screen.getByText('Profile')).toBeInTheDocument();
  expect(screen.getByText('Account')).toBeInTheDocument();
  expect(screen.getByText('Security')).toBeInTheDocument();
  expect(screen.getByText('Sessions')).toBeInTheDocument();
  expect(screen.getByText('Access Tokens')).toBeInTheDocument();
});

test('displays mobile menu toggle', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={mockNavSections}
      currentPath="/settings/profile"
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  expect(
    screen.getByRole('button', { name: /navigation menu/i })
  ).toBeInTheDocument();
});

test('includes skip link for accessibility', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={mockNavSections}
      currentPath="/settings/profile"
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  expect(
    screen.getByRole('link', { name: /skip to main content/i })
  ).toBeInTheDocument();
});

test('handles empty navigation sections', () => {
  render(
    <SidebarLayout sidebarTitle="Settings" navSections={[]} currentPath="">
      <div>Main Content</div>
    </SidebarLayout>
  );

  expect(screen.getAllByText('Settings')).toHaveLength(2); // Both mobile header and sidebar
  expect(screen.getByText('Main Content')).toBeInTheDocument();
});

test('handles sections without labels', () => {
  const sectionsWithoutLabels: NavSection[] = [
    {
      items: [
        { href: '/item1', label: 'Item 1' },
        { href: '/item2', label: 'Item 2' },
      ],
    },
  ];

  render(
    <SidebarLayout
      sidebarTitle="Test"
      navSections={sectionsWithoutLabels}
      currentPath=""
    >
      <div>Content</div>
    </SidebarLayout>
  );

  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.getByText('Item 2')).toBeInTheDocument();
});

test('passes currentPath to sidebar for active state', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={mockNavSections}
      currentPath="/settings/profile"
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  const allNavItems = screen.getAllByTestId('sidebar-nav-item');
  const activeLink = allNavItems.find(
    (item) => item.getAttribute('aria-current') === 'page'
  );
  expect(activeLink).toBeDefined();
  expect(activeLink).toHaveTextContent('Profile');
});

test('renders custom titleHref when provided', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      titleHref="/custom-settings"
      navSections={mockNavSections}
      currentPath=""
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  const titleLink = screen.getByRole('link', { name: /settings/i });
  expect(titleLink).toHaveAttribute('href', '/custom-settings');
});

test('uses default titleHref when not provided', () => {
  render(
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={mockNavSections}
      currentPath=""
    >
      <div>Main Content</div>
    </SidebarLayout>
  );

  // The titleHref defaults to the first navigation item's href
  const titleLink = screen.getByRole('link', { name: /settings/i });
  expect(titleLink).toHaveAttribute('href', '/settings/profile');
});
