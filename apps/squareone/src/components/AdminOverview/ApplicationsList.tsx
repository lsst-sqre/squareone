import { useId } from 'react';

import type { ApplicationLink } from '../../lib/admin/overview';
import styles from './AdminOverview.module.css';
import listStyles from './ApplicationsList.module.css';

type ApplicationsListProps = {
  /** One link per enabled application (see `buildApplicationLinks`). */
  links: ApplicationLink[];
};

/** "41 applications", or "1 application". */
function formatCount(count: number): string {
  return `${count} ${count === 1 ? 'application' : 'applications'}`;
}

/**
 * The overview's Applications section: every Phalanx application enabled in
 * the environment, each linking to its page in the Phalanx documentation.
 *
 * Discovery's application list carries only names, independent of the
 * services it publishes, so the section is a compact multi-column list of
 * links, sorted alphabetically, rather than a table. Without any
 * applications, the section says so instead of showing an empty list.
 */
export default function ApplicationsList({ links }: ApplicationsListProps) {
  const headingId = useId();
  const sorted = [...links].sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>Applications</h2>
      <p className={listStyles.lead}>
        Phalanx applications enabled in this environment, linking to their
        documentation.
      </p>
      {sorted.length > 0 ? (
        <>
          <p className={listStyles.count}>{formatCount(sorted.length)}</p>
          <ul className={listStyles.list} aria-labelledby={headingId}>
            {sorted.map((link) => (
              <li key={link.name} className={listStyles.item}>
                <a href={link.docsUrl}>{link.name}</a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.detailEmpty}>
          Service discovery lists no applications.
        </p>
      )}
    </section>
  );
}
