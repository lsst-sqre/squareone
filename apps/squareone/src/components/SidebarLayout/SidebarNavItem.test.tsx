import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import SidebarNavItem from './SidebarNavItem';

const mockItem = {
  href: '/settings/profile',
  label: 'Profile Settings',
};

const defaultProps = {
  item: mockItem,
  isActive: false,
  onNavigate: vi.fn((e) => {
    if (e) e.preventDefault();
  }),
};

test('renders navigation item as link', () => {
  render(<SidebarNavItem {...defaultProps} />);

  const link = screen.getByRole('link', { name: 'Profile Settings' });
  expect(link).toHaveAttribute('href', '/settings/profile');
});

test('displays correct label text', () => {
  render(<SidebarNavItem {...defaultProps} />);

  expect(screen.getByText('Profile Settings')).toBeInTheDocument();
});

test('calls onNavigate when clicked', () => {
  const mockOnNavigate = vi.fn((e) => {
    if (e) e.preventDefault();
  });
  render(<SidebarNavItem {...defaultProps} onNavigate={mockOnNavigate} />);

  const link = screen.getByRole('link');
  fireEvent.click(link);

  expect(mockOnNavigate).toHaveBeenCalledTimes(1);
});

test('sets aria-current when active', () => {
  render(<SidebarNavItem {...defaultProps} isActive={true} />);

  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('aria-current', 'page');
});

test('does not set aria-current when inactive', () => {
  render(<SidebarNavItem {...defaultProps} isActive={false} />);

  const link = screen.getByRole('link');
  expect(link).not.toHaveAttribute('aria-current', 'page');
});

test('has correct test id', () => {
  render(<SidebarNavItem {...defaultProps} />);

  expect(screen.getByTestId('sidebar-nav-item')).toBeInTheDocument();
});

test('handles items with different href formats', () => {
  const externalItem = {
    href: 'https://example.com',
    label: 'External Link',
  };

  render(<SidebarNavItem {...defaultProps} item={externalItem} />);

  const link = screen.getByRole('link', { name: 'External Link' });
  expect(link).toHaveAttribute('href', 'https://example.com');
});

test('handles items with long labels', () => {
  const longLabelItem = {
    href: '/settings/very-long-setting-name',
    label: 'This is a very long navigation item label that might wrap',
  };

  render(<SidebarNavItem {...defaultProps} item={longLabelItem} />);

  expect(
    screen.getByText(
      'This is a very long navigation item label that might wrap'
    )
  ).toBeInTheDocument();
});

test('handles items with special characters in label', () => {
  const specialCharItem = {
    href: '/settings/special',
    label: 'Settings & Preferences',
  };

  render(<SidebarNavItem {...defaultProps} item={specialCharItem} />);

  expect(screen.getByText('Settings & Preferences')).toBeInTheDocument();
});

test('is keyboard accessible', () => {
  const mockOnNavigate = vi.fn((e) => {
    if (e) e.preventDefault();
  });
  render(<SidebarNavItem {...defaultProps} onNavigate={mockOnNavigate} />);

  const link = screen.getByRole('link');
  link.focus();

  expect(link).toHaveFocus();

  fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' });
  expect(mockOnNavigate).toHaveBeenCalled();
});

test('prevents default behavior correctly', () => {
  const mockOnNavigate = vi.fn((e) => {
    if (e) e.preventDefault();
  });
  render(<SidebarNavItem {...defaultProps} onNavigate={mockOnNavigate} />);

  const link = screen.getByRole('link');
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(clickEvent, 'preventDefault', {
    value: vi.fn(),
    writable: false,
  });

  fireEvent(link, clickEvent);

  expect(mockOnNavigate).toHaveBeenCalled();
  expect(clickEvent.preventDefault).toHaveBeenCalled();
});
