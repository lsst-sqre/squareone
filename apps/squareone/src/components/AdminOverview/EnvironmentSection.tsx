import { KeyValueList, type KeyValueListItem } from '@lsst-sqre/squared';
import { useId } from 'react';

import type { EnvironmentSummary } from '../../lib/admin/overview';
import styles from './AdminOverview.module.css';

type EnvironmentSectionProps = {
  /** The environment summary, or `null` when discovery names none. */
  environment: EnvironmentSummary | null;
};

/**
 * The overview's Environment section: what Repertoire says about this
 * Phalanx environment.
 *
 * The heading is the environment's long title. Under Repertoire 2.x, which
 * publishes only the environment's name, the heading falls back to
 * "Environment" and the list shows just the name.
 */
export default function EnvironmentSection({
  environment,
}: EnvironmentSectionProps) {
  const headingId = useId();

  const items: KeyValueListItem[] = [];
  if (environment?.label) {
    items.push({ key: 'Phalanx label', value: environment.label });
  }
  if (environment) {
    items.push({ key: 'Name', value: environment.name });
  }
  if (environment?.description) {
    items.push({ key: 'Description', value: environment.description });
  }
  if (environment?.docsUrl) {
    items.push({
      key: 'Documentation',
      value: <a href={environment.docsUrl}>Phalanx documentation</a>,
    });
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>{environment?.titleLong ?? 'Environment'}</h2>
      {environment ? (
        <KeyValueList items={items} />
      ) : (
        <p>Service discovery does not describe this environment.</p>
      )}
    </section>
  );
}
