import React, { useState } from 'react';
import type { TokenHistoryFilters as FilterType } from '../../hooks/useTokenHistoryFilters';
import TokenHistoryFilters from './TokenHistoryFilters';

export default {
  title: 'Components/TokenHistory/TokenHistoryFilters',
  component: TokenHistoryFilters,
};

// Default empty filters
const defaultFilters: FilterType = {
  tokenType: undefined,
  token: undefined,
  since: undefined,
  until: undefined,
  ipAddress: undefined,
};

// Basic stories
export const Default = {
  args: {
    filters: defaultFilters,
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: false,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};

export const WithFiltersApplied = {
  args: {
    filters: {
      token: 'abc123xyz987def456ghi',
      ipAddress: '192.168.1.1',
      since: new Date('2025-03-01T00:00Z'),
      until: new Date('2025-03-15T23:59Z'),
    },
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: false,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};

export const ExpandedState = {
  args: {
    filters: defaultFilters,
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: true,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};

// Interactive story with state management
export const Interactive = {
  render: () => {
    const [filters, setFilters] = useState<FilterType>(defaultFilters);
    const [expandAll, setExpandAll] = useState(false);

    const handleFilterChange = (newFilters: Partial<FilterType>) => {
      console.log('Filter changed:', newFilters);
      setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleClearFilters = () => {
      console.log('Clear filters clicked');
      setFilters(defaultFilters);
    };

    const handleToggleExpandAll = () => {
      console.log('Toggle expand all clicked');
      setExpandAll((prev) => !prev);
    };

    return (
      <div>
        <TokenHistoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          expandAll={expandAll}
          onToggleExpandAll={handleToggleExpandAll}
        />
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: 'var(--rsd-color-gray-100)',
            borderRadius: '4px',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0' }}>Current State:</h4>
          <pre style={{ margin: 0, fontSize: '14px' }}>
            {JSON.stringify({ filters, expandAll }, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

// Responsive layout demonstration
export const ResponsiveLayout = {
  render: () => {
    const [filters, setFilters] = useState<FilterType>(defaultFilters);

    return (
      <div>
        <div
          style={{
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: 'var(--rsd-color-blue-100)',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <strong>Tip:</strong> Resize the viewport to see responsive layout
          changes
        </div>
        <TokenHistoryFilters
          filters={filters}
          onFilterChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, ...newFilters }))
          }
          onClearFilters={() => setFilters(defaultFilters)}
          expandAll={false}
          onToggleExpandAll={() => {}}
        />
      </div>
    );
  },
};

// Sticky behavior demonstration (requires scrollable container)
export const StickyBehavior = {
  render: () => {
    const [filters, setFilters] = useState<FilterType>(defaultFilters);

    return (
      <div>
        <div
          style={{
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: 'var(--rsd-color-blue-100)',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <strong>Tip:</strong> Scroll down to see the filters stick to the top
          with a shadow
        </div>
        <TokenHistoryFilters
          filters={filters}
          onFilterChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, ...newFilters }))
          }
          onClearFilters={() => setFilters(defaultFilters)}
          expandAll={false}
          onToggleExpandAll={() => {}}
        />
        <div style={{ height: '2000px', padding: '16px' }}>
          <p>Scroll down to see sticky behavior...</p>
          <div
            style={{
              marginTop: '1000px',
              padding: '16px',
              backgroundColor: 'var(--rsd-color-gray-100)',
              borderRadius: '4px',
            }}
          >
            <p>The filter bar should be stuck to the top with a shadow.</p>
            <p>
              Current filters: <code>{JSON.stringify(filters, null, 2)}</code>
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Date range filtering example
export const WithDateRange = {
  args: {
    filters: {
      since: new Date('2025-03-01T00:00Z'),
      until: new Date('2025-03-31T23:59Z'),
    },
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: false,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};

// Token key filtering example
export const WithTokenKey = {
  args: {
    filters: {
      token: 'abc123xyz987def456ghi',
    },
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: false,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};

// IP address filtering example
export const WithIPAddress = {
  args: {
    filters: {
      ipAddress: '192.168.1.0/24',
    },
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: false,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};

// Multiple filters combined
export const WithMultipleFilters = {
  args: {
    filters: {
      token: 'abc123xyz987def456ghi',
      ipAddress: '192.168.1.1',
      since: new Date('2025-03-01T00:00Z'),
      until: new Date('2025-03-15T23:59Z'),
    },
    onFilterChange: (filters: Partial<FilterType>) =>
      console.log('Filter changed:', filters),
    onClearFilters: () => console.log('Clear filters clicked'),
    expandAll: true,
    onToggleExpandAll: () => console.log('Toggle expand all clicked'),
  },
};
