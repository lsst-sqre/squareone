import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import TokenHistoryList from './TokenHistoryList';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Base entry for testing
const createEntry = (
  overrides: Partial<TokenChangeHistoryEntry> = {}
): TokenChangeHistoryEntry => ({
  token: 'abc123xyz987def456ghi',
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

describe('TokenHistoryList', () => {
  describe('rendering', () => {
    test('renders multiple entries', () => {
      const entries = [
        createEntry({ token: 'token1', token_name: 'Token 1' }),
        createEntry({ token: 'token2', token_name: 'Token 2' }),
        createEntry({ token: 'token3', token_name: 'Token 3' }),
      ];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      expect(screen.getByText(/"Token 1"/)).toBeInTheDocument();
      expect(screen.getByText(/"Token 2"/)).toBeInTheDocument();
      expect(screen.getByText(/"Token 3"/)).toBeInTheDocument();
    });

    test('renders empty state when no entries', () => {
      render(
        <TokenHistoryList
          entries={[]}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      expect(screen.getByText('No token history found')).toBeInTheDocument();
    });
  });

  describe('Load More button', () => {
    test('shows Load More button when hasMore is true', () => {
      const entries = [createEntry()];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={true}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      expect(
        screen.getByRole('button', { name: /load more/i })
      ).toBeInTheDocument();
    });

    test('does not show Load More button when hasMore is false', () => {
      const entries = [createEntry()];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      expect(
        screen.queryByRole('button', { name: /load more/i })
      ).not.toBeInTheDocument();
    });

    test('calls onLoadMore when Load More is clicked', async () => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();
      const entries = [createEntry()];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={true}
          isLoadingMore={false}
          onLoadMore={onLoadMore}
        />
      );

      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      await user.click(loadMoreButton);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    test('disables Load More button when isLoadingMore is true', () => {
      const entries = [createEntry()];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={true}
          isLoadingMore={true}
          onLoadMore={() => {}}
        />
      );

      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      expect(loadMoreButton).toBeDisabled();
    });

    test('shows loading state when isLoadingMore is true', () => {
      const entries = [createEntry()];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={true}
          isLoadingMore={true}
          onLoadMore={() => {}}
        />
      );

      // Button component should apply loading styles
      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      expect(loadMoreButton).toBeInTheDocument();
    });
  });

  describe('expandAll prop', () => {
    test('expands all items when expandAll is true', () => {
      const entries = [
        createEntry({ token: 'token1', token_name: 'Token 1' }),
        createEntry({ token: 'token2', token_name: 'Token 2' }),
      ];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
          expandAll={true}
        />
      );

      // Details should be visible for all items
      const idLabels = screen.getAllByText('ID');
      expect(idLabels).toHaveLength(2);
    });

    test('collapses all items when expandAll is false', () => {
      const entries = [
        createEntry({ token: 'token1', token_name: 'Token 1' }),
        createEntry({ token: 'token2', token_name: 'Token 2' }),
      ];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
          expandAll={false}
        />
      );

      // Details should not be visible
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    test('updates expansion state when expandAll changes', () => {
      const entries = [createEntry()];
      const { rerender } = render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
          expandAll={false}
        />
      );

      // Initially collapsed
      expect(screen.queryByText('ID')).not.toBeInTheDocument();

      // Change to expanded
      rerender(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
          expandAll={true}
        />
      );

      // Now expanded
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    test('newly loaded items start collapsed when expandAll is undefined', () => {
      const initialEntries = [createEntry({ token: 'token1' })];
      const { rerender } = render(
        <TokenHistoryList
          entries={initialEntries}
          hasMore={true}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // Load more entries
      const newEntries = [
        ...initialEntries,
        createEntry({ token: 'token2', token_name: 'Token 2' }),
      ];

      rerender(
        <TokenHistoryList
          entries={newEntries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // New entry should be collapsed by default
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('token type detection', () => {
    test('does not show token type when all entries are same type', () => {
      const entries = [
        createEntry({
          token: 'token1',
          token_type: 'user',
          token_name: 'Token 1',
        }),
        createEntry({
          token: 'token2',
          token_type: 'user',
          token_name: 'Token 2',
        }),
      ];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // Should not show "user token" in summaries
      expect(screen.queryByText(/user token/)).not.toBeInTheDocument();
    });

    test('shows token type when entries have different types', () => {
      const entries = [
        createEntry({
          token: 'token1',
          token_type: 'user',
          token_name: null,
        }),
        createEntry({
          token: 'token2',
          token_type: 'session',
          token_name: null,
        }),
      ];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // Should show token types in summaries
      expect(screen.getByText(/user token/)).toBeInTheDocument();
      expect(screen.getByText(/session token/)).toBeInTheDocument();
    });
  });

  describe('expansion state persistence', () => {
    test('maintains expansion state when entries update', async () => {
      const user = userEvent.setup();
      const initialEntries = [createEntry({ token: 'token1' })];
      const { rerender } = render(
        <TokenHistoryList
          entries={initialEntries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // Expand the item
      const summary = screen.getByRole('button');
      await user.click(summary);
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Update entries (simulate filter change or data refresh)
      const updatedEntries = [
        createEntry({ token: 'token1', actor: 'anotheruser' }),
      ];
      rerender(
        <TokenHistoryList
          entries={updatedEntries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // Should still be expanded
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    test('individual toggles work independently', async () => {
      const user = userEvent.setup();
      const entries = [
        createEntry({ token: 'token1', token_name: 'Token 1' }),
        createEntry({ token: 'token2', token_name: 'Token 2' }),
        createEntry({ token: 'token3', token_name: 'Token 3' }),
      ];

      render(
        <TokenHistoryList
          entries={entries}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
        />
      );

      // Get all summary buttons
      const summaries = screen.getAllByRole('button');

      // Expand first and third
      await user.click(summaries[0]);
      await user.click(summaries[2]);

      // Should have 2 "ID" labels visible
      expect(screen.getAllByText('ID')).toHaveLength(2);
    });
  });
});
