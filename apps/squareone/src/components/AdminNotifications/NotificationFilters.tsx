import type { AdminNotificationFilters } from '@lsst-sqre/semaphore-client';
import { Button, DateTimePicker, TextInput } from '@lsst-sqre/squared';
import { X } from 'lucide-react';
import type React from 'react';

import styles from './NotificationFilters.module.css';

export type NotificationFiltersProps = {
  /** The current filter values, typically derived from the URL. */
  filters: AdminNotificationFilters;
  /** Called with the subset of filters that changed. */
  onFilterChange: (filters: Partial<AdminNotificationFilters>) => void;
  /** Called when the user clears every filter at once. */
  onClearFilters: () => void;
};

/**
 * Presentational filter bar for the admin notifications listing.
 *
 * Renders recipient/sender text inputs and since/until date-time pickers, plus
 * a clear-all control. It owns no state: values are seeded from `filters` and
 * every change is reported through `onFilterChange` (the container persists
 * them to the URL). The date pickers are keyed by their current value so a
 * change to `filters` from outside (e.g. loading a bookmarked URL) re-seeds
 * the uncontrolled picker.
 */
export default function NotificationFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: NotificationFiltersProps) {
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onFilterChange({ recipient: value || undefined });
  };

  const handleSenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onFilterChange({ sender: value || undefined });
  };

  const handleSinceChange = (iso: string) => {
    onFilterChange({ since: iso ? new Date(iso) : undefined });
  };

  const handleUntilChange = (iso: string) => {
    onFilterChange({ until: iso ? new Date(iso) : undefined });
  };

  return (
    <div className={styles.container}>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-recipient" className={styles.filterLabel}>
          Recipient
        </label>
        <TextInput
          id="filter-recipient"
          type="text"
          value={filters.recipient || ''}
          onChange={handleRecipientChange}
          placeholder="Username"
          size="sm"
          aria-label="Filter by recipient"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-sender" className={styles.filterLabel}>
          Sender
        </label>
        <TextInput
          id="filter-sender"
          type="text"
          value={filters.sender || ''}
          onChange={handleSenderChange}
          placeholder="Sender"
          size="sm"
          aria-label="Filter by sender"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-since" className={styles.filterLabel}>
          Since
        </label>
        <DateTimePicker
          key={`since-${filters.since?.toISOString() ?? 'none'}`}
          defaultValue={filters.since?.toISOString() || ''}
          onChange={handleSinceChange}
          defaultTimezone="local"
          showTimezone={true}
          placeholder="Start date"
          size="sm"
          aria-label="Filter by start date"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-until" className={styles.filterLabel}>
          Until
        </label>
        <DateTimePicker
          key={`until-${filters.until?.toISOString() ?? 'none'}`}
          defaultValue={filters.until?.toISOString() || ''}
          onChange={handleUntilChange}
          defaultTimezone="local"
          showTimezone={true}
          placeholder="End date"
          size="sm"
          aria-label="Filter by end date"
        />
      </div>

      <Button
        appearance="outline"
        tone="secondary"
        size="sm"
        leadingIcon={X}
        onClick={onClearFilters}
        aria-label="Clear all filters"
      >
        Clear filters
      </Button>
    </div>
  );
}
