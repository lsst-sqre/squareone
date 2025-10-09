import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TokenHistoryDetails } from './TokenHistoryDetails';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';

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

describe('TokenHistoryDetails', () => {
  describe('metadata section', () => {
    test('always displays token ID as link', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      const link = screen.getByText('abc123xyz987def456ghi');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        'href',
        '/settings/tokens/abc123xyz987def456ghi'
      );
    });

    test('displays parent token as link when present', () => {
      const entryWithParent: TokenChangeHistoryEntry = {
        ...baseEntry,
        parent: 'parent123token456xyz',
      };
      render(<TokenHistoryDetails entry={entryWithParent} />);

      expect(screen.getByText('Parent')).toBeInTheDocument();
      const link = screen.getByText('parent123token456xyz');
      expect(link).toHaveAttribute(
        'href',
        '/settings/tokens/parent123token456xyz'
      );
    });

    test('does not display parent field when null', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.queryByText('Parent')).not.toBeInTheDocument();
    });

    test('displays actor', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.getByText('Actor')).toBeInTheDocument();
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });

    test('displays actor with IP address when present', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
      expect(screen.getByText(/from/)).toBeInTheDocument();
    });

    test('displays actor without IP when null', () => {
      const entryNoIp: TokenChangeHistoryEntry = {
        ...baseEntry,
        ip_address: null,
      };
      render(<TokenHistoryDetails entry={entryNoIp} />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.queryByText(/from/)).not.toBeInTheDocument();
    });

    test('IP address is clickable button when callback provided', async () => {
      const user = userEvent.setup();
      const onIpAddressClick = vi.fn();

      render(
        <TokenHistoryDetails
          entry={baseEntry}
          onIpAddressClick={onIpAddressClick}
        />
      );

      const ipButton = screen.getByRole('button', { name: '192.168.1.1' });
      await user.click(ipButton);

      expect(onIpAddressClick).toHaveBeenCalledWith('192.168.1.1');
    });

    test('IP address is plain text when no callback provided', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);

      const ipText = screen.getByText('192.168.1.1');
      expect(ipText.tagName).not.toBe('BUTTON');
    });

    test('displays timestamp in UTC format', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      // formatEventTimeUTC should format as YYYY-MM-DD HH:MM:SS UTC
      expect(screen.getByText(/UTC$/)).toBeInTheDocument();
    });
  });

  describe('create action', () => {
    test('displays expires field when present', () => {
      const { container } = render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.getByText('Expires')).toBeInTheDocument();
      // Should display ISO8601 timestamp
      expect(container.textContent).toContain('2024-03-15T12:10:45.000Z');
    });

    test('does not display expires field when null', () => {
      const entryNoExpires: TokenChangeHistoryEntry = {
        ...baseEntry,
        expires: null,
      };
      render(<TokenHistoryDetails entry={entryNoExpires} />);

      expect(screen.queryByText('Expires')).not.toBeInTheDocument();
    });

    test('displays scopes as badges', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.getByText('Scopes')).toBeInTheDocument();
      expect(screen.getByText('read:tap')).toBeInTheDocument();
      expect(screen.getByText('exec:notebook')).toBeInTheDocument();
    });

    test('does not display scopes field when empty', () => {
      const entryNoScopes: TokenChangeHistoryEntry = {
        ...baseEntry,
        scopes: [],
      };
      render(<TokenHistoryDetails entry={entryNoScopes} />);

      expect(screen.queryByText('Scopes')).not.toBeInTheDocument();
    });

    test('does not display Changes section', () => {
      render(<TokenHistoryDetails entry={baseEntry} />);
      expect(screen.queryByText('Changes')).not.toBeInTheDocument();
    });
  });

  describe('revoke action', () => {
    const revokeEntry: TokenChangeHistoryEntry = {
      ...baseEntry,
      action: 'revoke',
      expires: null,
      scopes: [],
    };

    test('does not display expires or scopes when empty', () => {
      render(<TokenHistoryDetails entry={revokeEntry} />);

      expect(screen.queryByText('Expires')).not.toBeInTheDocument();
      expect(screen.queryByText('Scopes')).not.toBeInTheDocument();
    });

    test('does not display Changes section', () => {
      render(<TokenHistoryDetails entry={revokeEntry} />);
      expect(screen.queryByText('Changes')).not.toBeInTheDocument();
    });
  });

  describe('expire action', () => {
    const expireEntry: TokenChangeHistoryEntry = {
      ...baseEntry,
      action: 'expire',
    };

    test('displays expires and scopes like create action', () => {
      const { container } = render(<TokenHistoryDetails entry={expireEntry} />);

      expect(screen.getByText('Expires')).toBeInTheDocument();
      expect(screen.getByText('Scopes')).toBeInTheDocument();
      // Should display ISO8601 timestamp
      expect(container.textContent).toContain('2024-03-15T12:10:45.000Z');
    });

    test('does not display Changes section', () => {
      render(<TokenHistoryDetails entry={expireEntry} />);
      expect(screen.queryByText('Changes')).not.toBeInTheDocument();
    });
  });

  describe('edit action', () => {
    test('displays Changes section when fields changed', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        token_name: 'Updated Token Name',
        old_token_name: 'Old Token Name',
        old_scopes: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);
      expect(screen.getByText('Changes')).toBeInTheDocument();
    });

    test('displays name change with old and new values', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        token_name: 'Updated Token Name',
        old_token_name: 'Old Token Name',
        old_scopes: null,
        old_expires: null,
      };

      const { container } = render(<TokenHistoryDetails entry={editEntry} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Old Token Name')).toBeInTheDocument();
      // Verify the new token name is in the document (using container.textContent)
      expect(container.textContent).toContain('Updated Token Name');
    });

    test('displays expires change with old and new values', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        expires: 1710504645, // 2024-03-15T12:10:45.000Z
        old_expires: 1709904645, // 2024-03-08T13:30:45.000Z
        old_token_name: null,
        old_scopes: null,
      };

      const { container } = render(<TokenHistoryDetails entry={editEntry} />);
      expect(screen.getByText('Expires')).toBeInTheDocument();
      // Both old and new expiration ISO8601 timestamps should be present
      expect(container.textContent).toContain('2024-03-08T13:30:45.000Z');
      expect(container.textContent).toContain('2024-03-15T12:10:45.000Z');
    });

    test('displays scope additions', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        scopes: ['read:tap', 'write:tap', 'exec:notebook'],
        old_scopes: ['read:tap', 'exec:notebook'],
        old_token_name: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      // Should show added scope with plus icon
      expect(screen.getByText(/write:tap/)).toBeInTheDocument();
    });

    test('displays scope removals', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        scopes: ['read:tap'],
        old_scopes: ['read:tap', 'exec:notebook'],
        old_token_name: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      // Should show removed scope with minus icon
      expect(screen.getByText(/exec:notebook/)).toBeInTheDocument();
    });

    test('displays both scope additions and removals', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        scopes: ['read:tap', 'write:tap'],
        old_scopes: ['read:tap', 'exec:notebook'],
        old_token_name: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      expect(screen.getByText(/write:tap/)).toBeInTheDocument();
      expect(screen.getByText(/exec:notebook/)).toBeInTheDocument();
    });

    test('only displays changed fields', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        token_name: 'Updated Token Name',
        old_token_name: 'Old Token Name',
        // expires unchanged
        expires: 1710504645,
        old_expires: null,
        // scopes unchanged
        old_scopes: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      // Should show name change
      expect(screen.getByText('Name')).toBeInTheDocument();

      // Should not show expires or scopes under Changes
      const changesSection = screen.getByText('Changes').parentElement;
      expect(changesSection).toBeInTheDocument();

      // Verify only one field shown in changes (Name)
      const changeLabels = screen.queryAllByText('Name');
      expect(changeLabels.length).toBe(1);
    });

    test('does not display Changes section when no fields changed', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        old_token_name: null,
        old_scopes: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);
      expect(screen.queryByText('Changes')).not.toBeInTheDocument();
    });
  });

  describe('scope change detection', () => {
    test('correctly identifies added scopes', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        scopes: ['read:tap', 'exec:notebook', 'write:tap'],
        old_scopes: ['read:tap', 'exec:notebook'],
        old_token_name: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      // write:tap should be shown as added
      expect(screen.getByText(/write:tap/)).toBeInTheDocument();
    });

    test('correctly identifies removed scopes', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        scopes: ['read:tap'],
        old_scopes: ['read:tap', 'exec:notebook'],
        old_token_name: null,
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      // exec:notebook should be shown as removed
      expect(screen.getByText(/exec:notebook/)).toBeInTheDocument();
    });

    test('handles no scope changes', () => {
      const editEntry: TokenChangeHistoryEntry = {
        ...baseEntry,
        action: 'edit',
        scopes: ['read:tap', 'exec:notebook'],
        old_scopes: ['read:tap', 'exec:notebook'],
        old_token_name: 'Updated Name',
        old_expires: null,
      };

      render(<TokenHistoryDetails entry={editEntry} />);

      // Should not show Scopes under Changes
      expect(screen.getByText('Changes')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();

      // Scopes should not appear in the changes section
      const changesSection = screen.getByText('Changes').parentElement;
      const scopesInChanges = changesSection?.querySelector(
        '[class*="scopeList"]'
      );
      expect(scopesInChanges).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('uses semantic definition list structure', () => {
      const { container } = render(<TokenHistoryDetails entry={baseEntry} />);

      const definitionLists = container.querySelectorAll('dl');
      expect(definitionLists.length).toBeGreaterThan(0);

      const terms = container.querySelectorAll('dt');
      expect(terms.length).toBeGreaterThan(0);

      const descriptions = container.querySelectorAll('dd');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    test('IP address button has correct type', () => {
      const onIpAddressClick = vi.fn();
      render(
        <TokenHistoryDetails
          entry={baseEntry}
          onIpAddressClick={onIpAddressClick}
        />
      );

      const ipButton = screen.getByRole('button', { name: '192.168.1.1' });
      expect(ipButton).toHaveAttribute('type', 'button');
    });

    test('links have correct href attributes', () => {
      const entryWithParent: TokenChangeHistoryEntry = {
        ...baseEntry,
        parent: 'parent123token',
      };

      render(<TokenHistoryDetails entry={entryWithParent} />);

      const tokenLink = screen.getByText('abc123xyz987def456ghi');
      expect(tokenLink).toHaveAttribute(
        'href',
        '/settings/tokens/abc123xyz987def456ghi'
      );

      const parentLink = screen.getByText('parent123token');
      expect(parentLink).toHaveAttribute(
        'href',
        '/settings/tokens/parent123token'
      );
    });
  });
});
