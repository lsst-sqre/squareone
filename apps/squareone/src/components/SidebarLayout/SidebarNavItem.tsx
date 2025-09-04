import React from 'react';
import styled from 'styled-components';

import type { NavItem } from './SidebarLayout';

export type SidebarNavItemProps = {
  item: NavItem;
  isActive: boolean;
  onNavigate: () => void;
};

const NavigationLink = styled.a<{ $isActive: boolean }>`
  display: block;
  padding: 0.5rem 0.75rem;
  color: inherit;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: var(--rsd-color-primary-100, #e6f3ff);
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid var(--rsd-color-primary-600, #0066cc);
    outline-offset: -2px;
  }

  /* Active/current page state */
  ${({ $isActive }) =>
    $isActive &&
    `
    font-weight: bold;
    border-left: 4px solid var(--rsd-color-primary-600, #0066cc);
    padding-left: calc(0.75rem - 4px); /* Adjust padding to account for border */
  `}
`;

/*
 * Individual navigation item component that renders a single navigation link
 * with proper visual states including hover, focus, and active/current states.
 * Supports both desktop and mobile layouts with consistent styling.
 */
export default function SidebarNavItem({
  item,
  isActive,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <NavigationLink
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      $isActive={isActive}
      data-testid="sidebar-nav-item"
    >
      {item.label}
    </NavigationLink>
  );
}
