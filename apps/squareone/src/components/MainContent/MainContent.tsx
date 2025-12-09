import type { ReactNode } from 'react';

import styles from './MainContent.module.css';

type MainContentProps = {
  children?: ReactNode;
};

/*
 * Main content wrapper (contained within a Page component).
 */
export default function MainContent({ children }: MainContentProps) {
  return <main className={styles.main}>{children}</main>;
}
