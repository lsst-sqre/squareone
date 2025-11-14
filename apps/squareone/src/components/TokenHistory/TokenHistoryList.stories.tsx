import React, { useState } from 'react';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import TokenHistoryList from './TokenHistoryList';

export default {
  title: 'Components/TokenHistory/TokenHistoryList',
  component: TokenHistoryList,
};

// Helper to create test entries
const createEntry = (
  overrides: Partial<TokenChangeHistoryEntry> = {}
): TokenChangeHistoryEntry => ({
  token: `abc${Math.random().toString(36).substring(7)}`,
  username: 'testuser',
  token_type: 'user',
  token_name: 'My Test Token',
  parent: null,
  scopes: ['read:tap', 'exec:notebook'],
  service: null,
  expires: 1710504645,
  actor: 'testuser',
  action: 'create',
  old_token_name: null,
  old_scopes: null,
  old_expires: null,
  ip_address: '192.168.1.1',
  event_time: 1709904645,
  ...overrides,
});

// Sample entries for stories
const sampleEntries: TokenChangeHistoryEntry[] = [
  createEntry({
    token: 'token1abc123xyz987def',
    token_name: 'Laptop Token',
    action: 'create',
    event_time: Date.now() / 1000 - 3600 * 2, // 2h ago
  }),
  createEntry({
    token: 'token2def456abc123xyz',
    token_name: 'API Token',
    action: 'edit',
    old_token_name: 'Old API Token',
    scopes: ['read:tap', 'write:tap', 'admin:users'],
    old_scopes: ['read:tap', 'exec:notebook'],
    event_time: Date.now() / 1000 - 3600 * 24, // 1d ago
  }),
  createEntry({
    token: 'token3ghi789def456abc',
    token_name: 'Mobile Token',
    action: 'revoke',
    scopes: [],
    event_time: Date.now() / 1000 - 3600 * 24 * 3, // 3d ago
  }),
  createEntry({
    token: 'token4jkl012ghi789def',
    token_name: 'Desktop Token',
    action: 'expire',
    actor: '(system)',
    event_time: Date.now() / 1000 - 3600 * 24 * 7, // 7d ago
  }),
];

// Basic stories
export const Default = {
  args: {
    entries: sampleEntries.slice(0, 3),
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => console.log('Load more clicked'),
  },
};

export const EmptyState = {
  args: {
    entries: [],
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => {},
  },
};

export const SingleEntry = {
  args: {
    entries: [sampleEntries[0]],
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => {},
  },
};

export const WithPagination = {
  args: {
    entries: sampleEntries,
    hasMore: true,
    isLoadingMore: false,
    onLoadMore: () => console.log('Load more clicked'),
  },
};

export const LoadingMore = {
  args: {
    entries: sampleEntries,
    hasMore: true,
    isLoadingMore: true,
    onLoadMore: () => {},
  },
};

// Interactive story with expandAll control
export const WithExpandAllControl = {
  render: () => {
    const [expandAll, setExpandAll] = useState(false);

    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <button onClick={() => setExpandAll(!expandAll)}>
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
          <span
            style={{ marginLeft: '8px', color: 'var(--rsd-color-gray-500)' }}
          >
            (expandAll: {expandAll.toString()})
          </span>
        </div>
        <TokenHistoryList
          entries={sampleEntries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
          expandAll={expandAll}
        />
      </div>
    );
  },
};

// Interactive story with pagination simulation
export const WithPaginationSimulation = {
  render: () => {
    const [entries, setEntries] = useState(sampleEntries.slice(0, 2));
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const hasMore = entries.length < sampleEntries.length;

    const handleLoadMore = () => {
      setIsLoadingMore(true);
      // Simulate API delay
      setTimeout(() => {
        const nextEntry = sampleEntries[entries.length];
        if (nextEntry) {
          setEntries([...entries, nextEntry]);
        }
        setIsLoadingMore(false);
      }, 1000);
    };

    return (
      <div>
        <p style={{ marginBottom: '16px', color: 'var(--rsd-color-gray-500)' }}>
          Loaded {entries.length} of {sampleEntries.length} entries
        </p>
        <TokenHistoryList
          entries={entries}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    );
  },
};

// Token type variations
export const MixedTokenTypes = {
  args: {
    entries: [
      createEntry({
        token: 'usertoken123',
        token_type: 'user',
        token_name: 'User Token',
        event_time: Date.now() / 1000 - 3600,
      }),
      createEntry({
        token: 'sessiontoken456',
        token_type: 'session',
        token_name: null,
        event_time: Date.now() / 1000 - 3600 * 2,
      }),
      createEntry({
        token: 'notebooktoken789',
        token_type: 'notebook',
        token_name: null,
        event_time: Date.now() / 1000 - 3600 * 3,
      }),
      createEntry({
        token: 'internaltoken012',
        token_type: 'internal',
        token_name: null,
        event_time: Date.now() / 1000 - 3600 * 4,
      }),
    ],
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => {},
  },
};

export const SameTokenType = {
  args: {
    entries: sampleEntries.map((entry) => ({
      ...entry,
      token_type: 'user' as const,
    })),
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => {},
  },
};

// Many entries for scroll testing
export const ManyEntries = {
  args: {
    entries: Array.from({ length: 20 }, (_, i) =>
      createEntry({
        token: `token${i}${Math.random().toString(36).substring(7)}`,
        token_name: `Token ${i + 1}`,
        action: ['create', 'edit', 'revoke', 'expire'][i % 4] as any,
        event_time: Date.now() / 1000 - 3600 * i,
      })
    ),
    hasMore: true,
    isLoadingMore: false,
    onLoadMore: () => console.log('Load more clicked'),
  },
};

// Edge cases
export const LongTokenNames = {
  args: {
    entries: [
      createEntry({
        token: 'token1',
        token_name:
          'This is a very long token name that demonstrates how the component handles lengthy text',
      }),
      createEntry({
        token: 'token2',
        token_name: 'Short',
      }),
      createEntry({
        token: 'token3',
        token_name:
          'Another extremely long token name that goes on and on and on',
      }),
    ],
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => {},
  },
};

export const ManyScopes = {
  args: {
    entries: [
      createEntry({
        scopes: [
          'read:tap',
          'write:tap',
          'exec:notebook',
          'admin:users',
          'admin:token',
          'read:all',
          'write:all',
          'exec:portal',
        ],
      }),
    ],
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => {},
  },
};
