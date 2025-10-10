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
 * Format a Date to ISO8601 string without seconds in UTC
 * @param date - Date object to format
 * @returns ISO8601 string in format YYYY-MM-DDTHH:mmZ (no seconds, UTC timezone)
 */
function formatDateWithoutSeconds(date: Date): string {
  const isoString = date.toISOString();
  // Remove seconds and milliseconds but keep UTC timezone: YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DDTHH:mmZ
  return isoString.substring(0, 16) + 'Z';
}

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

  const handleSinceChange = (value: string) => {
    onFilterChange({ since: value ? new Date(value) : undefined });
  };

  const handleUntilChange = (value: string) => {
    onFilterChange({ until: value ? new Date(value) : undefined });
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
      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="filter-since" className={styles.filterLabel}>
            Since
          </label>
          <DateTimePicker
            value={filters.since ? formatDateWithoutSeconds(filters.since) : ''}
            onChange={handleSinceChange}
            timezone="local"
            showTimezone={true}
            placeholder="Start date"
            size="md"
            aria-label="Filter by start date"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-until" className={styles.filterLabel}>
            Until
          </label>
          <DateTimePicker
            value={filters.until ? formatDateWithoutSeconds(filters.until) : ''}
            onChange={handleUntilChange}
            timezone="local"
            showTimezone={true}
            placeholder="End date"
            size="md"
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
            size="md"
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
            size="md"
            aria-label="Filter by IP address"
          />
        </div>
      </div>

      <div className={styles.actionsSection}>
        <Button
          appearance="outline"
          tone="secondary"
          size="md"
          leadingIcon={expandAll ? faChevronUp : faChevronDown}
          onClick={onToggleExpandAll}
          aria-label={expandAll ? 'Collapse all entries' : 'Expand all entries'}
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </Button>

        <Button
          appearance="outline"
          tone="secondary"
          size="md"
          leadingIcon={faXmark}
          onClick={onClearFilters}
          aria-label="Clear all filters"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
