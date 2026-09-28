import { BookOpen } from 'lucide-react';

import styles from './DocsIconLink.module.css';

type DocsIconLinkProps = {
  /** URL of the documentation to link to. */
  href: string;
  /**
   * Accessible name and tooltip for the link. The link shows only an icon, so
   * this is its only name: make it meaningful out of context and unique among
   * the page's other docs links (e.g. `"IVOA TAP docs"`).
   */
  label: string;
};

/**
 * Icon-only (book) link to documentation, placed after the item it documents,
 * such as an API endpoint name or a quota's limit.
 */
export default function DocsIconLink({ href, label }: DocsIconLinkProps) {
  return (
    <a className={styles.link} href={href} title={label} aria-label={label}>
      <BookOpen size={16} aria-hidden="true" />
    </a>
  );
}
