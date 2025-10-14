import React, { useState, useEffect, useRef } from 'react';
import { DateTimePicker } from '@lsst-sqre/squared';
import { TextInput } from '@lsst-sqre/squared';
import { Button } from '@lsst-sqre/squared';
import {
  faChevronDown,
  faChevronUp,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import type { TokenHistoryFilters as FilterType } from '../../hooks/useTokenHistoryFilters';
import styles from './TokenHistoryFilters.module.css';

export type TokenHistoryFiltersProps = {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
};

/**
 * Filter controls for token history page.
 * Provides date range filtering, token key search, IP address filtering,
 * expand/collapse all control, and clear filters action.
 */
export default function TokenHistoryFilters({
  filters,
  onFilterChange,
  onClearFilters,
  expandAll,
  onToggleExpandAll,
}: TokenHistoryFiltersProps) {
  const [isStuck, setIsStuck] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect when the filter bar is stuck to the top
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSinceChange = (iso: string) => {
    // Convert ISO8601 string to Date for the filter state
    const date = iso ? new Date(iso) : undefined;
    onFilterChange({ since: date });
  };

  const handleUntilChange = (iso: string) => {
    // Convert ISO8601 string to Date for the filter state
    const date = iso ? new Date(iso) : undefined;
    onFilterChange({ until: date });
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onFilterChange({ token: value || undefined });
  };

  const handleIpAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onFilterChange({ ipAddress: value || undefined });
  };

  const containerClassNames = [styles.container, isStuck && styles.stuck]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={containerClassNames}>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-since" className={styles.filterLabel}>
          Since
        </label>
        <DateTimePicker
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
          defaultValue={filters.until?.toISOString() || ''}
          onChange={handleUntilChange}
          defaultTimezone="local"
          showTimezone={true}
          placeholder="End date"
          size="sm"
          aria-label="Filter by end date"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-token" className={styles.filterLabel}>
          Token
        </label>
        <TextInput
          id="filter-token"
          type="text"
          value={filters.token || ''}
          onChange={handleTokenChange}
          placeholder="Token key (22 chars)"
          size="sm"
          aria-label="Filter by token key"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-ip" className={styles.filterLabel}>
          IP Address
        </label>
        <TextInput
          id="filter-ip"
          type="text"
          value={filters.ipAddress || ''}
          onChange={handleIpAddressChange}
          placeholder="IP address or CIDR"
          size="sm"
          aria-label="Filter by IP address"
        />
      </div>

      <Button
        appearance="outline"
        tone="secondary"
        size="sm"
        leadingIcon={expandAll ? faChevronUp : faChevronDown}
        onClick={onToggleExpandAll}
        aria-label={expandAll ? 'Collapse all entries' : 'Expand all entries'}
      >
        {expandAll ? 'Collapse All' : 'Expand All'}
      </Button>

      <Button
        appearance="outline"
        tone="secondary"
        size="sm"
        leadingIcon={faXmark}
        onClick={onClearFilters}
        aria-label="Clear all filters"
      >
        Clear Filters
      </Button>
    </div>
  );
}
