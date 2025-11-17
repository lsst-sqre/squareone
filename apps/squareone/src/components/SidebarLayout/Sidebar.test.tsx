import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Sidebar from './Sidebar';
import type { NavSection } from './SidebarLayout';

const mockNavSections: NavSection[] = [
  {
    items: [
      { href: '/settings/profile', label: 'Profile' },
      { href: '/settings/account', label: 'Account Settings' },
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

const defaultProps = {
  title: 'Settings',
  titleHref: '/settings',
  navSections: mockNavSections,
  currentPath: '',
  onNavigate: vi.fn((e) => {
    if (e) e.preventDefault();
  }),
};

test('renders sidebar title as heading', () => {
  render(<Sidebar {...defaultProps} />);

  expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
});

test('renders title as clickable link', () => {
  render(<Sidebar {...defaultProps} />);

  const titleLink = screen.getByRole('link', { name: 'Settings' });
  expect(titleLink).toHaveAttribute('href', '/settings');
});

test('renders all navigation items', () => {
  render(<Sidebar {...defaultProps} />);

  expect(screen.getByText('Profile')).toBeInTheDocument();
  expect(screen.getByText('Account Settings')).toBeInTheDocument();
  expect(screen.getByText('Access Tokens')).toBeInTheDocument();
  expect(screen.getByText('Privacy')).toBeInTheDocument();
});

test('renders section labels when provided', () => {
  render(<Sidebar {...defaultProps} />);

  expect(screen.getByText('Security')).toBeInTheDocument();
});

test('does not render section label when not provided', () => {
  const sectionsWithoutLabel: NavSection[] = [
    {
      items: [{ href: '/item1', label: 'Item 1' }],
    },
  ];

  render(<Sidebar {...defaultProps} navSections={sectionsWithoutLabel} />);

  expect(screen.getByText('Item 1')).toBeInTheDocument();
  // No label should be present for sections without labels
  expect(screen.queryByTestId('section-label')).not.toBeInTheDocument();
});

test('marks current page as active', () => {
  render(<Sidebar {...defaultProps} currentPath="/settings/profile" />);

  const activeLink = screen.getByRole('link', { name: 'Profile' });
  expect(activeLink).toHaveAttribute('aria-current', 'page');
});

test('only marks one item as active', () => {
  render(<Sidebar {...defaultProps} currentPath="/settings/profile" />);

  const links = screen.getAllByRole('link');
  const activeLinks = links.filter(
    (link) => link.getAttribute('aria-current') === 'page'
  );
  expect(activeLinks).toHaveLength(1);
});

test('handles empty navigation sections', () => {
  render(<Sidebar {...defaultProps} navSections={[]} />);

  expect(screen.getByText('Settings')).toBeInTheDocument();
  expect(screen.queryByRole('navigation')).toBeInTheDocument();
});

test('handles sections with empty items array', () => {
  const emptySection: NavSection[] = [
    {
      label: 'Empty Section',
      items: [],
    },
  ];

  render(<Sidebar {...defaultProps} navSections={emptySection} />);

  expect(screen.getByText('Empty Section')).toBeInTheDocument();
});

test('calls onNavigate when title is clicked', () => {
  const mockOnNavigate = vi.fn((e) => {
    if (e) e.preventDefault();
  });
  render(<Sidebar {...defaultProps} onNavigate={mockOnNavigate} />);

  const titleLink = screen.getByRole('link', { name: 'Settings' });
  titleLink.click();

  expect(mockOnNavigate).toHaveBeenCalled();
});

test('provides proper semantic structure', () => {
  render(<Sidebar {...defaultProps} />);

  // Should have aside element for semantic structure
  expect(screen.getByRole('complementary')).toBeInTheDocument();

  // Should have navigation element
  expect(screen.getByRole('navigation')).toBeInTheDocument();

  // Title should be a proper heading
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
});
