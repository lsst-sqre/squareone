import type { ReactNode } from 'react';

import styles from './AppShell.module.css';

type AppShellProps = {
  /**
   * Page chrome rendered above the main content (site header, broadcast
   * banners). It is placed after the skip link but outside the `<main>`
   * landmark.
   */
  chrome?: ReactNode;
  /** Page content, rendered inside the single `<main>` landmark. */
  children?: ReactNode;
};

/**
 * Application shell that owns the "skip to main content" link and the single
 * root `<main>` landmark.
 *
 * The skip link is rendered as the very first element in the shell so it is
 * the first Tab stop on every page. Activating it jumps focus past the page
 * chrome (`chrome`: header navigation, broadcast banners) into the single
 * `<main id="main-content">` landmark, which is focusable (`tabIndex={-1}`).
 *
 * There must be exactly one `<main>` per page, so page-level and layout-level
 * content wrappers (MainContent, SidebarLayout, TimesSquareApp) render inside
 * this landmark rather than declaring their own `<main>`.
 *
 * The `<main>` is a layout-neutral `display: block` wrapper that adds no
 * spacing of its own (page content owns its centering/max-width), keeping the
 * existing sticky-footer flex layout undisturbed. It is deliberately kept a
 * real box rather than `display: contents` so that, with `tabIndex={-1}`, it
 * can receive programmatic focus as the skip-link target.
 */
export default function AppShell({ chrome, children }: AppShellProps) {
  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      {chrome}
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
