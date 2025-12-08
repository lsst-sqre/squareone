import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { forwardRef } from 'react';

import styles from './MobileMenuToggle.module.css';

export type MobileMenuToggleProps = {
  isOpen: boolean;
  onClick: () => void;
  id?: string;
};

/*
 * Mobile menu toggle button component.
 * Renders a hamburger icon button using FontAwesome that's only visible
 * on mobile viewports. Includes proper ARIA attributes and focus states.
 */
const MobileMenuToggle = forwardRef<HTMLButtonElement, MobileMenuToggleProps>(
  function MobileMenuToggle({ isOpen, onClick, id }, ref) {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        className={styles.toggleButton}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        data-testid="mobile-menu-toggle"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
    );
  }
);

export default MobileMenuToggle;
