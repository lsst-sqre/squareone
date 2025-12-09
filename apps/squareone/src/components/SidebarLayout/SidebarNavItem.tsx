import Link from 'next/link';
import type { KeyboardEvent, MouseEvent } from 'react';
import React, { useRef } from 'react';

import type { NavItem } from './SidebarLayout';
import styles from './SidebarNavItem.module.css';

export type SidebarNavItemProps = {
  item: NavItem;
  isActive: boolean;
  onNavigate: (e?: MouseEvent | KeyboardEvent) => void;
};

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
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: MouseEvent) => {
    onNavigate(e);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Let Next.js Link handle navigation, only call onNavigate for side effects
      onNavigate(e);
    }
  };

  return (
    <Link
      ref={linkRef}
      href={item.href}
      className={isActive ? styles.linkActive : styles.link}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={isActive ? 'page' : undefined}
      data-testid="sidebar-nav-item"
    >
      {item.label}
    </Link>
  );
}
