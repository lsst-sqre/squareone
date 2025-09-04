import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ContentMaxWidth } from '../../styles/sizes';

export type MobileMenuToggleProps = {
  isOpen: boolean;
  onClick: () => void;
};

const ToggleButton = styled.button`
  /* Mobile: visible hamburger button */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 0.375rem;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--rsd-color-primary-100, #e6f3ff);
  }

  &:focus {
    outline: none;
    border-color: var(--rsd-color-primary-600, #0066cc);
    background-color: var(--rsd-color-primary-50, #f0f9ff);
  }

  &:active {
    background-color: var(--rsd-color-primary-200, #bfdbfe);
  }

  /* Desktop: completely hidden */
  @media (min-width: ${ContentMaxWidth}) {
    display: none;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

/*
 * Mobile menu toggle button component.
 * Renders a hamburger icon button using FontAwesome that's only visible
 * on mobile viewports. Includes proper ARIA attributes and focus states.
 */
const MobileMenuToggle = React.forwardRef<
  HTMLButtonElement,
  MobileMenuToggleProps
>(function MobileMenuToggle({ isOpen, onClick }, ref) {
  return (
    <ToggleButton
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      data-testid="mobile-menu-toggle"
    >
      <FontAwesomeIcon icon="bars" />
    </ToggleButton>
  );
});

export default MobileMenuToggle;
