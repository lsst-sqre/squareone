import type { ReactNode } from 'react';

import styles from './WideContentLayout.module.css';

type WideContentLayoutProps = {
  children?: ReactNode;
};

/*
 * A <main> content layout wrapper that provides a wide layout for apps like
 * Times Square.
 */
export default function WideContentLayout({
  children,
}: WideContentLayoutProps) {
  return <div className={styles.container}>{children}</div>;
}
