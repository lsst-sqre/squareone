import React from 'react';
import styled from 'styled-components';

import type { NavItem } from './SidebarLayout';

export type SidebarNavItemProps = {
  item: NavItem;
  isActive: boolean;
  onNavigate: (e?: React.MouseEvent | React.KeyboardEvent) => void;
};

const NavigationLink = styled.a<{ $isActive: boolean }>`
  display: block;
  padding: 0.25rem 0.75rem;
  margin-left: -0.75rem;
  color: inherit;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease, color 0.2s ease;
  position: relative;

  &:hover {
    background-color: var(--rsd-color-primary-100, #e6f3ff);
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid var(--rsd-color-primary-600, #0066cc);
    outline-offset: -2px;
  }

  /* Active/current page state - using pseudo-element for left bar */
  ${({ $isActive }) =>
    $isActive &&
    `
    font-weight: bold;
    border-radius: 0 0.5rem 0.5rem 0;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: var(--rsd-color-primary-600, #0066cc);
      border-radius: 2px;
    }
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
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(e);
    }
  };

  return (
    <NavigationLink
      href={item.href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={isActive ? 'page' : undefined}
      $isActive={isActive}
      data-testid="sidebar-nav-item"
    >
      {item.label}
    </NavigationLink>
  );
}
