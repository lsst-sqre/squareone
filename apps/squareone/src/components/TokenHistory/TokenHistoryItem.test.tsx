import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import TokenHistoryItem from './TokenHistoryItem';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Base entry for testing
const baseEntry: TokenChangeHistoryEntry = {
  token: 'abc123xyz987def456ghi',
  username: 'testuser',
  token_type: 'user',
  token_name: 'My Test Token',
  parent: null,
  scopes: ['read:tap', 'exec:notebook'],
  service: null,
  expires: 1710504645, // March 15, 2025
  actor: 'testuser',
  action: 'create',
  old_token_name: null,
  old_scopes: null,
  old_expires: null,
  ip_address: '192.168.1.1',
  event_time: 1709904645, // March 8, 2025
};

describe('TokenHistoryItem', () => {
  describe('uncontrolled mode', () => {
    test('renders collapsed by default', () => {
      render(<TokenHistoryItem entry={baseEntry} />);

      // Summary should be visible
      expect(screen.getByText(/Created/)).toBeInTheDocument();

      // Details should not be visible
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    test('expands when summary is clicked', async () => {
      const user = userEvent.setup();
      render(<TokenHistoryItem entry={baseEntry} />);

      // Click to expand
      const summary = screen.getByRole('button');
      await user.click(summary);

      // Details should now be visible
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('abc123xyz987def456ghi')).toBeInTheDocument();
    });

    test('collapses when clicked again', async () => {
      const user = userEvent.setup();
      render(<TokenHistoryItem entry={baseEntry} />);

      const summary = screen.getByRole('button');

      // Expand
      await user.click(summary);
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Collapse
      await user.click(summary);
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    test('maintains expansion state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TokenHistoryItem entry={baseEntry} />);

      // Expand
      const summary = screen.getByRole('button');
      await user.click(summary);
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Re-render with same entry
      rerender(<TokenHistoryItem entry={baseEntry} />);

      // Should still be expanded
      expect(screen.getByText('ID')).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    test('uses provided isExpanded state', () => {
      const onToggle = vi.fn();
      render(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={true}
          onToggle={onToggle}
        />
      );

      // Details should be visible because isExpanded={true}
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    test('calls onToggle when summary is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={false}
          onToggle={onToggle}
        />
      );

      const summary = screen.getByRole('button');
      await user.click(summary);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test('does not manage internal state when controlled', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { rerender } = render(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={false}
          onToggle={onToggle}
        />
      );

      // Click to toggle
      const summary = screen.getByRole('button');
      await user.click(summary);

      // onToggle called but state doesn't change (parent controls it)
      expect(onToggle).toHaveBeenCalled();

      // Re-render with same isExpanded={false}
      rerender(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={false}
          onToggle={onToggle}
        />
      );

      // Should still be collapsed
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    test('expands when parent updates isExpanded to true', () => {
      const onToggle = vi.fn();
      const { rerender } = render(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={false}
          onToggle={onToggle}
        />
      );

      // Initially collapsed
      expect(screen.queryByText('ID')).not.toBeInTheDocument();

      // Parent updates to expanded
      rerender(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={true}
          onToggle={onToggle}
        />
      );

      // Should now be expanded
      expect(screen.getByText('ID')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    test('summary button is keyboard focusable', async () => {
      const user = userEvent.setup();
      render(<TokenHistoryItem entry={baseEntry} />);

      const summary = screen.getByRole('button');

      // Tab to focus
      await user.tab();

      expect(summary).toHaveFocus();
    });

    test('can toggle with keyboard (Enter)', async () => {
      const user = userEvent.setup();
      render(<TokenHistoryItem entry={baseEntry} />);

      const summary = screen.getByRole('button');
      await user.tab();
      expect(summary).toHaveFocus();

      // Press Enter to expand
      await user.keyboard('{Enter}');
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Press Enter again to collapse
      await user.keyboard('{Enter}');
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    test('can toggle with keyboard (Space)', async () => {
      const user = userEvent.setup();
      render(<TokenHistoryItem entry={baseEntry} />);

      const summary = screen.getByRole('button');
      await user.tab();
      expect(summary).toHaveFocus();

      // Press Space to expand
      await user.keyboard(' ');
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Press Space again to collapse
      await user.keyboard(' ');
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    test('has correct aria-expanded attribute', async () => {
      const user = userEvent.setup();
      render(<TokenHistoryItem entry={baseEntry} />);

      const summary = screen.getByRole('button');

      // Initially collapsed
      expect(summary).toHaveAttribute('aria-expanded', 'false');

      // Expand
      await user.click(summary);
      expect(summary).toHaveAttribute('aria-expanded', 'true');

      // Collapse
      await user.click(summary);
      expect(summary).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('showTokenType prop', () => {
    test('passes showTokenType to TokenHistorySummary', () => {
      render(<TokenHistoryItem entry={baseEntry} showTokenType={true} />);

      // When showTokenType is true and token has no name, should show type
      const entryWithoutName: TokenChangeHistoryEntry = {
        ...baseEntry,
        token_name: null,
        token_type: 'session',
      };

      const { rerender } = render(
        <TokenHistoryItem entry={entryWithoutName} showTokenType={true} />
      );

      // Should show "session token" in summary
      expect(screen.getByText(/session token/)).toBeInTheDocument();
    });

    test('does not show token type when showTokenType is false', () => {
      const entryWithoutName: TokenChangeHistoryEntry = {
        ...baseEntry,
        token_name: null,
        token_type: 'session',
      };

      render(
        <TokenHistoryItem entry={entryWithoutName} showTokenType={false} />
      );

      // Should show "token" without type
      expect(screen.queryByText(/session token/)).not.toBeInTheDocument();
      expect(screen.getByText(/^Created token/)).toBeInTheDocument();
    });
  });

  describe('action types', () => {
    test('renders create action', () => {
      render(<TokenHistoryItem entry={baseEntry} />);
      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });

    test('renders edit action', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        old_token_name: 'Old Token Name',
      };
      render(<TokenHistoryItem entry={editEntry} />);
      expect(screen.getByText(/Edited/)).toBeInTheDocument();
    });

    test('renders revoke action', () => {
      const revokeEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'revoke',
      };
      render(<TokenHistoryItem entry={revokeEntry} />);
      expect(screen.getByText(/Revoked/)).toBeInTheDocument();
    });

    test('renders expire action', () => {
      const expireEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'expire',
      };
      render(<TokenHistoryItem entry={expireEntry} />);
      expect(screen.getByText(/Expired/)).toBeInTheDocument();
    });
  });

  describe('expansion state persistence', () => {
    test('persists expansion state when entry updates (same token)', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TokenHistoryItem entry={baseEntry} />);

      // Expand
      const summary = screen.getByRole('button');
      await user.click(summary);
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Update entry but keep same token key
      const updatedEntry = { ...baseEntry, actor: 'anotheruser' };
      rerender(<TokenHistoryItem entry={updatedEntry} />);

      // Should still be expanded
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    test('defaults to collapsed when switching to uncontrolled mode', () => {
      const onToggle = vi.fn();
      const { rerender } = render(
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={true}
          onToggle={onToggle}
        />
      );

      // Initially expanded (controlled)
      expect(screen.getByText('ID')).toBeInTheDocument();

      // Switch to uncontrolled by removing props
      rerender(<TokenHistoryItem entry={baseEntry} />);

      // Should default to collapsed in uncontrolled mode
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });
  });
});
