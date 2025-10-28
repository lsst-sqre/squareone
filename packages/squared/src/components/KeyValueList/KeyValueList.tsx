import React from 'react';
import styles from './KeyValueList.module.css';

export type KeyValueListItem = {
  key: string;
  value: string | React.ReactNode;
};

export type KeyValueListProps = {
  /**
   * Array of key-value pairs to display
   */
  items: KeyValueListItem[];

  /**
   * Additional CSS class names
   */
  className?: string;
};

export function KeyValueList({ items, className }: KeyValueListProps) {
  const classNames = [styles.keyValueList, className].filter(Boolean).join(' ');

  return (
    <dl className={classNames}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <dt className={styles.term}>{item.key}</dt>
          <dd className={styles.definition}>{item.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
