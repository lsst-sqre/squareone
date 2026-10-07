import { KeyValueList, type KeyValueListItem } from '@lsst-sqre/squared';

import type { EnvironmentSummary } from '../../lib/admin/overview';
import styles from './AdminOverview.module.css';

type EnvironmentSectionProps = {
  /** The environment summary, or `null` when discovery names none. */
  environment: EnvironmentSummary | null;
};

/**
 * The overview's opening key-value list: what Repertoire says about this
 * Phalanx environment, directly under the page's "Overview" heading with no
 * heading of its own.
 *
 * Under Repertoire 2.x, which publishes only the environment's name, the list
 * shows just the name. The documentation link names the Phalanx environment
 * ("Phalanx idfdev documentation") so it reads well out of context.
 */
export default function EnvironmentSection({
  environment,
}: EnvironmentSectionProps) {
  if (!environment) {
    return (
      <div className={styles.section}>
        <p>Service discovery does not describe this environment.</p>
      </div>
    );
  }

  const items: KeyValueListItem[] = [];
  if (environment.label) {
    items.push({ key: 'Phalanx label', value: environment.label });
  }
  items.push({ key: 'Name', value: environment.name });
  if (environment.titleLong) {
    items.push({ key: 'Title', value: environment.titleLong });
  }
  if (environment.description) {
    items.push({ key: 'Description', value: environment.description });
  }
  if (environment.docsUrl) {
    const label = environment.label
      ? `Phalanx ${environment.label} documentation`
      : 'Phalanx documentation';
    items.push({
      key: 'Documentation',
      value: <a href={environment.docsUrl}>{label}</a>,
    });
  }

  return (
    <div className={styles.section}>
      <KeyValueList items={items} />
    </div>
  );
}
