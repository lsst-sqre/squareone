import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { NavSection } from './SidebarLayout';
import SidebarNavSection from './SidebarNavSection';

const mockSectionWithLabel: NavSection = {
  label: 'Security',
  items: [
    { href: '/settings/tokens', label: 'Access Tokens' },
    { href: '/settings/privacy', label: 'Privacy' },
  ],
};

const mockSectionWithoutLabel: NavSection = {
  items: [
    { href: '/settings/profile', label: 'Profile' },
    { href: '/settings/account', label: 'Account Settings' },
  ],
};

const defaultProps = {
  section: mockSectionWithLabel,
  sectionIndex: 0,
  currentPath: '',
  onNavigate: vi.fn((e) => {
    if (e) e.preventDefault();
  }),
};

test('renders section with label', () => {
  render(<SidebarNavSection {...defaultProps} />);

  expect(screen.getByText('Security')).toBeInTheDocument();
  expect(screen.getByTestId('section-label')).toBeInTheDocument();
});

test('renders section without label when not provided', () => {
  render(
    <SidebarNavSection {...defaultProps} section={mockSectionWithoutLabel} />
  );

  expect(screen.queryByTestId('section-label')).not.toBeInTheDocument();
});

test('renders all navigation items in section', () => {
  render(<SidebarNavSection {...defaultProps} />);

  expect(screen.getByText('Access Tokens')).toBeInTheDocument();
  expect(screen.getByText('Privacy')).toBeInTheDocument();
});

test('passes correct props to navigation items', () => {
  render(
    <SidebarNavSection {...defaultProps} currentPath="/settings/tokens" />
  );

  const activeLink = screen.getByRole('link', { name: 'Access Tokens' });
  expect(activeLink).toHaveAttribute('aria-current', 'page');

  const inactiveLink = screen.getByRole('link', { name: 'Privacy' });
  expect(inactiveLink).not.toHaveAttribute('aria-current', 'page');
});

test('has correct test id with section index', () => {
  render(<SidebarNavSection {...defaultProps} sectionIndex={2} />);

  expect(screen.getByTestId('nav-section-2')).toBeInTheDocument();
});

test('handles empty items array', () => {
  const emptySection: NavSection = {
    label: 'Empty Section',
    items: [],
  };

  render(<SidebarNavSection {...defaultProps} section={emptySection} />);

  expect(screen.getByText('Empty Section')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('renders proper semantic HTML structure', () => {
  render(<SidebarNavSection {...defaultProps} />);

  // Section should be wrapped in appropriate container
  expect(screen.getByTestId('nav-section-0')).toBeInTheDocument();

  // Should have a list structure
  const list = screen.getByRole('list');
  expect(list).toBeInTheDocument();

  // List items should exist
  const listItems = screen.getAllByRole('listitem');
  expect(listItems).toHaveLength(2);
});

test('section label has proper heading semantics', () => {
  render(<SidebarNavSection {...defaultProps} />);

  const sectionLabel = screen.getByRole('heading', { name: 'Security' });
  expect(sectionLabel).toBeInTheDocument();
  expect(sectionLabel.tagName).toBe('H3');
});

test('handles single item in section', () => {
  const singleItemSection: NavSection = {
    label: 'Single Item',
    items: [{ href: '/single', label: 'Only Item' }],
  };

  render(<SidebarNavSection {...defaultProps} section={singleItemSection} />);

  expect(screen.getByText('Single Item')).toBeInTheDocument();
  expect(screen.getByText('Only Item')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});

test('handles long section labels', () => {
  const longLabelSection: NavSection = {
    label:
      'This is a very long section label that might wrap to multiple lines',
    items: [{ href: '/test', label: 'Test Item' }],
  };

  render(<SidebarNavSection {...defaultProps} section={longLabelSection} />);

  expect(
    screen.getByText(
      'This is a very long section label that might wrap to multiple lines'
    )
  ).toBeInTheDocument();
});

test('passes onNavigate handler to all navigation items', () => {
  const mockOnNavigate = vi.fn((e) => {
    if (e) e.preventDefault();
  });
  render(<SidebarNavSection {...defaultProps} onNavigate={mockOnNavigate} />);

  const firstLink = screen.getByText('Access Tokens');
  firstLink.click();

  expect(mockOnNavigate).toHaveBeenCalledTimes(1);
});
