import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test } from 'vitest';
import type { NavSection } from './SidebarLayout';
import SidebarLayout from './SidebarLayout';

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
      { href: '/settings/tokens', label: 'Access Tokens' },
      { href: '/settings/privacy', label: 'Privacy' },
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
  expect(screen.getByText('Access Tokens')).toBeInTheDocument();
  expect(screen.getByText('Privacy')).toBeInTheDocument();
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

  const titleLinks = screen.getAllByRole('link', { name: /settings/i });
  // Should be exactly 2 links: mobile header and sidebar title
  expect(titleLinks).toHaveLength(2);
  // Both should have the custom href
  titleLinks.forEach((link) => {
    expect(link).toHaveAttribute('href', '/custom-settings');
  });
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
  const titleLinks = screen.getAllByRole('link', { name: /settings/i });
  // Should be exactly 2 links: mobile header and sidebar title
  expect(titleLinks).toHaveLength(2);
  // Both should have the default href from first nav item
  titleLinks.forEach((link) => {
    expect(link).toHaveAttribute('href', '/settings/profile');
  });
});
