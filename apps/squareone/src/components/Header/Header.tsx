'use client';

import styles from './Header.module.css';
import HeaderNav from './HeaderNav';
import PreHeader from './PreHeader';

/*
 * Site header, including logo, navigation, and log-in component.
 */
export default function Header() {
  return (
    <header className={styles.header}>
      <PreHeader />
      <HeaderNav />
    </header>
  );
}
