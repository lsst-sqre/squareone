import type { ReactNode } from 'react';

import styles from './MainContent.module.css';

type MainContentProps = {
  children?: ReactNode;
};

/*
 * Main content wrapper.
 *
 * The single `<main>` landmark is owned by the root layout's AppShell, so this
 * wrapper renders a plain `<div>` inside that landmark rather than declaring
 * its own `<main>` (which would create a duplicate landmark).
 */
export default function MainContent({ children }: MainContentProps) {
  return <div className={styles.main}>{children}</div>;
}
